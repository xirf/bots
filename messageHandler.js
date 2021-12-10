const fs = require("fs");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const request = require("request");
const teslang = require("./lib/lang");
const scrapy = require("node-scrapy");
const Genius = require("genius-lyrics");
const translate = require("translate-google");
const { Brainly } = require("brainly-scraper-v2");
const webpConverter = require("./lib/webpconverter");
const bahasa_planet = require("./lib/bahasa_planet");
const WSF = require("wa-sticker-formatter");
const { MessageType, Mimetype } = require("@adiwajshing/baileys");
const NLP = require("@hiyurigi/nlp")("TextCorrection");
const prefix = fs.readFileSync("./config/prefix.txt", "utf-8");
const factList = JSON.parse(fs.readFileSync("./lib/fact.json", "utf-8"));
const quotesList = JSON.parse(fs.readFileSync("./lib/quotes.json", "utf-8"));
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { LatinKeAksara } = require("@sajenid/aksara.js");
const brain = new Brainly("id");
const { isNull } = require("util");
const bufferImagesForPdf = {};
const questionAnswer = {};
const inPdfInput = [];


const ytregex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
const Client = new Genius.Client("uO-XWa9PYgZn-t7UrNW_YTDlUrNCtMq8xmCxySRRGXP4QJ0mtFwoqi1z-ywdGmXj");

let v = new NLP([
	'giftextsticker', 'stickernobg', 'textsticker',
	'stikernobg', 'gifsticker', 'randomfact',
	'kodebahasa', 'gifstiker', 'translate',
	'wikipedia', 'contact', 'sticker',
	'donatur', 'brainly', 'bplanet',
	'lyrics', 'stiker', 'binary',
	'aksara', 'quotes', 'cancel',
	'lirik', 'ytmp3', 'gempa',
	'snobg', 'toimg', 'togif',
	'write', 'tulis', 'help',
	'menu', 'gtts', 'kbbi',
	'fact', 'math', 'done',
	'pdf', 'bin', 'hex',
	'yt', 'tl', 't',
]);

module.exports = async (conn, message) => {
	const senderNumber = message.key.remoteJid;
	const imageMessage = message.message.imageMessage;
	const videoMessage = message.message.videoMessage;
	const stickerMessage = message.message.stickerMessage;
	const extendedTextMessage = message.message.extendedTextMessage;
	const buttons = message.message.buttonsResponseMessage
	const quotedMessageContext = extendedTextMessage && extendedTextMessage.contextInfo && extendedTextMessage.contextInfo;
	const quotedMessage = quotedMessageContext && quotedMessageContext.quotedMessage;

	let buttonMessages;
	if (buttons != undefined) {
		buttonMessages = buttons.selectedDisplayText
	}

	const textMessage = message.message.conversation || message.message.extendedTextMessage && message.message.extendedTextMessage.text || imageMessage && imageMessage.caption || videoMessage && videoMessage.caption || buttonMessages
	const sender = conn.contacts[senderNumber]
	let WAUser = sender?.notify || sender?.short || sender?.name || sender?.vname || conn?.user?.name

	if (textMessage == '.menu') {

		const buttons = [{
			buttonId: 'id1',
			buttonText: {
				displayText: '!help'
			},
			type: 1
		},
		{
			buttonId: 'id2',
			buttonText: {
				displayText: '!contact'
			},
			type: 1
		}
		]

		const buttonMessage = {
			contentText: `Halo selamat datang di *${conn.user.name}* silahkan gunakan *${prefix}help* untuk melihat perintah yang tersedia 😆`,
			footerText: 'kamu juga bisa menekan tombol ini',
			buttons: buttons,
			headerType: 1
		}

		conn.sendMessage(senderNumber, buttonMessage, MessageType.buttonsMessage, {
			quoted: message
		});
	}

	let command, parameter;
	if (textMessage) {

		let a = textMessage.trim().split("\n");
		let b = "";

		c = a[0].split(" ")[0]

		b += a[0].split(" ").slice(1).join(" ");
		b += a.slice(1).join("\n")
		parameter = b.trim();
		pre = c.charAt(0);
		d = c.substring(1);

		if (pre == prefix) {
			if (!d) {
				let e = parameter.split(" ")
				d = e[0];

				parameter = parameter.split(" ").slice(1).join(" ");
			}

			if (d.toLowerCase() == "routes") {
				command = "quotes";
			} else {
				let result = v.TextCorrection({
					Needle: d,
					Threshold: 0.7,
					NgramsLength: 1
				});
				command = result[0].Key;
			}
		}

	}

	const stickerParameter = parameter || WAUser

	if (inPdfInput.includes(senderNumber)) {
		if (stickerMessage) return;

		const buttons = [{
			buttonId: 'id1',
			buttonText: {
				displayText: '!cancel'
			},
			type: 1
		},
		{
			buttonId: 'id2',
			buttonText: {
				displayText: '!done'
			},
			type: 1
		}
		]

		if (command == `done` || bufferImagesForPdf[senderNumber].length > 19) {
			const pdf = new PDFDocument({
				autoFirstPage: false
			});
			const bufferImages = bufferImagesForPdf[senderNumber];
			for (const bufferImage of bufferImages) {
				const image = pdf.openImage(bufferImage);
				pdf.addPage({
					size: [image.width, image.height]
				});
				pdf.image(image, 0, 0);
			}

			const pathFile = ".temp/" + Math.floor(Math.random() * 1000000 + 1) + ".pdf";
			const file = fs.createWriteStream(pathFile);
			pdf.pipe(file)
			pdf.end()

			file.on("finish", () => {
				const file = fs.readFileSync(pathFile);
				conn.sendMessage(senderNumber, file, MessageType.document, {
					mimetype: Mimetype.pdf,
					filename: Math.floor(Math.random() * 1000000) + ".pdf",
					quoted: message
				});
				fs.unlinkSync(pathFile);
				inPdfInput.splice(inPdfInput.indexOf(senderNumber), 1);
				delete bufferImagesForPdf[senderNumber];
			})

		} else if (command == `cancel`) {
			delete bufferImagesForPdf[senderNumber];
			inPdfInput.splice(inPdfInput.indexOf(senderNumber), 1);
			conn.sendMessage(senderNumber, "Operasi dibatalkan!", MessageType.text, {
				quoted: message
			})

		} else if (imageMessage && imageMessage.mimetype == "image/jpeg") {
			const bufferImage = await conn.downloadMediaMessage(message);
			bufferImagesForPdf[senderNumber].push(bufferImage);

			const buttonMessage = {
				contentText: `Yay ${bufferImagesForPdf[senderNumber].length} gambar telah sukses ditambahkan\n\nKirim *${prefix}done* jika selesai, *!cancel* jika ingin membatalkan`,
				footerText: `${conn.user.name} ${prefix}pdf`,
				buttons: buttons,
				headerType: 1
			}

			conn.sendMessage(senderNumber, buttonMessage, MessageType.buttonsMessage, {
				quoted: message
			});

		} else {

			const buttonMessage = {
				contentText: `Ups maaf kirim gambar ya kak jangan stiker atau text 😊\n\nKirim *${prefix}done* jika selesai, *!cancel* jika ingin membatalkan`,
				footerText: `${conn.user.name} ${prefix}pdf`,
				buttons: buttons,
				headerType: 1
			}

			conn.sendMessage(senderNumber, buttonMessage, MessageType.buttonsMessage, {
				quoted: message
			});

			return;
		}
	}

	switch (command) {

		case `t`: {
			let result = v.TextCorrection({
				Needle: parameter,
				Threshold: 0.4,
				NgramsLength: 1
			});
			const text = result[0].Key;
			console.log(result);
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `binary`:
		case `bin`: {
			const bin = parameter.split('').map(function (char) {
				return char.charCodeAt(0).toString(2);
			}).join(' ');
			const text = `hasil konversi *${parameter}* ke Biner adalah\n\n*${bin}*`;

			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `hex`: {
			let hexa = parameter.split('').map(function (char) {
				return char.charCodeAt(0).toString(16);
			}).join(' ');

			const text = `hasil konversi *${parameter}* ke Hexadesimal adalah:\n\n*${hexa}*`

			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `help`:
		case `menu`: {
			const text = fs.readFileSync("./config/menu.txt", 'utf-8');

			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `contact`: {
			const text = fs.readFileSync("./config/contact.txt", "utf-8");
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}
		case `donatur`: {
			const text = fs.readFileSync("./config/donatur.txt", "utf-8");
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `kbbi`: {
			const url = 'https://kbbi.kemdikbud.go.id/entri/';
			const model = {
				lema: 'h2',
				arti: ['ol li', 'ul.adjusted-par'],
				makna: 'ul.adjusted-par li'
			}

			fetch(url + encodeURIComponent(parameter)).then((res) => res.text()).then((body) => {
				result = scrapy.extract(body, model);

				let judul = ('arti kata *( ' + result.lema + ')* dalam KBBI adalah:\n\n');

				let data = result.arti

				if (data == null) {
					const text = judul + result.makna;

					conn.sendMessage(senderNumber, text, MessageType.text, {
						quoted: message
					});

				} else if (data != null) {

					data.forEach((arr, i) => {
						data[i] = (i + 1).toString() + ". " + arr
					});

					let isi = data.join('\n\n');

					const text = judul + isi;
					conn.sendMessage(senderNumber, text, MessageType.text, {
						quoted: message
					});

				} else {
					conn.sendMessage(senderNumber, "maaf tidak ditemukan coba periksa ejaan atau coba kata lainnya", MessageType.text, {
						quoted: message
					});
				};
			});
			break;
		}

		case `aksara`: {
			if (quotedMessage) {
				message.message = quotedMessage;
			}
			if (!parameter) {
				conn.sendMessage(senderNumber, "Tidak ada text :)", MessageType.text, {
					quoted: message
				});
				break;
			}
			let wada = LatinKeAksara(parameter);
			const text = wada;
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `sticker`:
		case `stiker`: {
			if (quotedMessage) {
				message.message = quotedMessage;
			}

			if (!message.message.imageMessage || message.message.imageMessage.mimetype != "image/jpeg") {
				conn.sendMessage(senderNumber, "Tidak ada gambar :)", MessageType.text, {
					quoted: message
				});
				break;
			}

			const imagePath = await conn.downloadAndSaveMediaMessage(message, Math.floor(Math.random() * 1000000));
			const sticker = new WSF.Sticker("./" + imagePath, {
				crop: false,
				pack: "Stiker",
				author: stickerParameter
			});
			await sticker.build();
			fs.unlinkSync(imagePath);
			const bufferImage = await sticker.get();
			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, {
				quoted: message
			});
			break;
		}

		case "toimg": {
			if (!quotedMessage || !quotedMessage.stickerMessage || quotedMessage.stickerMessage.mimetype != "image/webp") {
				conn.sendMessage(senderNumber, "Ups, stikernya mana ya kak?", MessageType.text, {
					quoted: message
				});
				break;
			}

			message.message = quotedMessage;
			const webpImage = await conn.downloadMediaMessage(message);
			const jpgImage = await webpConverter.webpToJpg(webpImage);
			conn.sendMessage(senderNumber, jpgImage, MessageType.image, {
				quoted: message,
				caption: "Ini kak gamabrnya >///<"
			});
			break;
		}

		case `togif`: {
			if (!quotedMessage || !quotedMessage.stickerMessage || quotedMessage.stickerMessage.mimetype != "image/webp") {
				conn.sendMessage(senderNumber, "Ups, Gamabrnya mana ya kak?", MessageType.text, {
					quoted: message
				});
				break;
			}

			message.message = quotedMessage;
			const webpImage = await conn.downloadMediaMessage(message);
			const video = await webpConverter.webpToVideo(webpImage);
			conn.sendMessage(senderNumber, video, MessageType.video, {
				quoted: message,
				mimetype: Mimetype.gif
			});
			break;
		}

		case `write`:
		case `nulis`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Ups, teks nya mana ya kak?", MessageType.text, {
					quoted: message
				});
				break;
			}

			const response = await axios.post("https://salism3api.pythonanywhere.com/write", {
				"text": parameter
			});
			const imagesUrl = response.data.images.slice(0, 6);

			for (const imageUrl of imagesUrl) {
				const response = await axios({
					url: imageUrl,
					method: "GET",
					responseType: "arraybuffer",
				});
				const image = Buffer.from(response.data, "binary");
				await conn.sendMessage(senderNumber, image, MessageType.image, {
					quoted: message
				});
			}
			break;
		}

		case `pdf`: {
			if (message.participant) {
				conn.sendMessage(senderNumber, "Maaf kak, demi menghindari spam fitur ini hanya tersedia di Private Chat", MessageType.text, {
					quoted: message
				});
				break;
			}

			if (imageMessage) {
				conn.sendMessage(senderNumber, "Ups kirim tanpa gambar ya kak", MessageType.text, {
					quoted: message
				});
				break;
			}

			inPdfInput.push(senderNumber);
			bufferImagesForPdf[senderNumber] = [];

			conn.sendMessage(senderNumber, "Silahkan kirim gambarnya satu persatu! jangan spam ya!", MessageType.text, {
				quoted: message
			});
			break;
		}

		case `brainly`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Mau cari apa kak?, jangan lupa ya apa yang mau dicari ditulis juga", MessageType.text, {
					quoted: message
				});
				break;
			}

			conn.sendMessage(senderNumber, "Sedang mencari jawabannya 🤨🔎", MessageType.text, {quoted: message})

			brain.searchWithMT("id", parameter).then(res => {
				let data = [];
				for (let i = 0; i < res.length; i++) {
					let soal = res[i].question.content;
					let answer = res[i].answers[0].content;

					data.push({
						title: `Soal: ${soal}\n\n`,
						description: `Jawaban: ${jawaban}`,
						rowId: "row" + i
					});
				}
				const sections = [{ title: `${conn.user.name} Brainly Command`, rows: data }]

				const button = {
					buttonText: 'Lihat jawaban',
					description: "Jawaban kamu sudah ada ditemukan\n\nSilahkan klik tombol dibawah ya😁",
					sections: sections,
					listType: 1
				}

				conn.sendMessage(senderNumber, button, MessageType.listMessage, { quoted: message });

			}).catch(err => {
				conn.sendMessage(senderNumber, "Maaf terjadi kesalahan kak Y^Y)", MessageType.text, {quoted: message});
			});

			break;
		}

		case `quotes`: {
			const quotes = quotesList[Math.floor(Math.random() * quotesList.length)];
			const text = `_"${quotes.quote}"_\n\n - ${quotes.by}`;
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `randomfact`:
		case `fact`: {
			const fact = factList[Math.floor(Math.random() * factList.length)];
			const text = `_${fact}_`
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `gtts`:
		case `tts`:
		case `text2sound`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Inputnya salah kak :)", MessageType.text, {
					quoted: message
				});
				break;
			}

			if (parameter.split(" ").length == 1) {
				conn.sendMessage(senderNumber, "Tidak ada kode bahasa / teks", MessageType.text, {
					quoted: message
				});
				break;
			}

			const language = parameter.split(" ")[0];
			const text = parameter.split(" ").splice(1).join(" ");
			axios({
				url: `https://salism3api.pythonanywhere.com/text2sound`,
				method: "POST",
				responseType: "arraybuffer",
				data: {
					"languageCode": language,
					"text": text,
				}
			}).then(response => {
				const audio = Buffer.from(response.data, "binary");
				conn.sendMessage(senderNumber, audio, MessageType.audio, {
					ptt: true,
					quoted: message
				});

			}).catch(response => {
				conn.sendMessage(senderNumber, `Kode bahasa *${language}* tidak ditemukan :(`, MessageType.text, {
					quoted: message
				});

			});
			break;
		}

		case `wikipedia`:
		case `wiki`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Inputnya salah kak :)", MessageType.text, {
					quoted: message
				});
				break;
			}

			axios.post("http://salism3api.pythonanywhere.com/wikipedia", {
				"query": parameter
			})
				.then(response => {
					const text = `*${response.data.title}*\n\n${response.data.content}`;
					conn.sendMessage(senderNumber, text, MessageType.text, {
						quoted: message
					});
				})
				.catch(e => {
					if ([500, 400, 404].includes(e.response.status)) {
						conn.sendMessage(senderNumber, `Artikel tidak ditemukan :(`, MessageType.text, {
							quoted: message
						});
					} else {
						throw e;
					}
				})
			break;
		}

		case `textsticker`:
		case `textstiker`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Ups teks nya jangan sampai lupa ya kak 😋", MessageType.text, {
					quoted: message
				});
				break;
			}

			const response = await axios.post("https://salism3api.pythonanywhere.com/text2img", {
				"text": parameter.slice(0, 60)
			});
			const sticker = new WSF.Sticker(response.data.image, {
				crop: false,
				pack: "Stiker",
				author: stickerParameter
			});
			await sticker.build();
			const bufferImage = await sticker.get();
			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, {
				quoted: message
			});
			break;
		}

		case `gifsticker`:
		case 'gifstiker': {
			if (quotedMessage) {
				message.message = quotedMessage;
			}

			if (!message.message.videoMessage || message.message.videoMessage.mimetype != "video/mp4") {
				conn.sendMessage(senderNumber, "Gif atau videonya mana ya🤔", MessageType.text, {
					quoted: message
				});
				break;
			}

			if (message.message.videoMessage.seconds > 8) {
				conn.sendMessage(senderNumber, "Hmm... maksimal 8 detik kak maaf ya 🥺", MessageType.text, {
					quoted: message
				});
				break;
			}

			const imagePath = await conn.downloadAndSaveMediaMessage(message, Math.floor(Math.random() * 1000000));
			const sticker = new WSF.Sticker("./" + imagePath, {
				animated: true,
				pack: "Sticker",
				author: stickerParameter
			});
			await sticker.build();
			fs.unlinkSync(imagePath);
			const bufferImage = await sticker.get();
			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, {
				quoted: message
			});
			break;
		}

		case `giftextsticker`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Teks nya mana ya kak? 🤔", MessageType.text, {
					quoted: message
				});
				break;
			}

			const response = await axios.post("https://salism3api.pythonanywhere.com/text2gif/", {
				"text": parameter.slice(0, 60)
			});
			let image = await axios.get(response.data.image, {
				"responseType": "arraybuffer"
			});
			image = Buffer.from(image.data, "binary");
			image = await webpConverter.gifToWebp(image);
			conn.sendMessage(senderNumber, image, MessageType.sticker, {
				quoted: message
			});
			break;
		}


		case `math`: {

			let tingkat = parameter.split(" ")[0];

			switch (tingkat) {
				case "trigonometri":
				case "trig": {
					let a = Math.floor(Math.random() * 101);
					let b = Math.floor(Math.random() * 101);
					let answer = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
					console.log('hasilnya adalah: ' + answer);
					const msg = await conn.sendMessage(senderNumber, `diketahui sebuah segitiga siku-siku dengan  alas = ${a} dan tinggi = ${b}, tentukan sisi miringnya\n\nbalas pesan ini untuk menjawab`, MessageType.text, {
						quoted: message
					});

					questionAnswer[msg.key.id] = parseInt(answer.toString())

					console.log(questionAnswer[msg.key.id]);

					setTimeout(() => {
						if (questionAnswer[msg.key.id]) {
							conn.sendMessage(senderNumber, `ups waktu habis jawabannya adalah *${hasil}*`, MessageType.text, {
								quoted: msg
							});
							delete questionAnswer[msg.key.id];
						}
					}, 600 * 1000)
					break;
				}
				default: {
					const response = await axios.get("https://salism3api.pythonanywhere.com/math/");
					let image = await axios.get(response.data.image, {
						"responseType": "arraybuffer"
					});
					image = Buffer.from(image.data, "binary");
					const msg = await conn.sendMessage(senderNumber, image, MessageType.image, {
						quoted: message,
						caption: "Balas pesan ini untuk menjawab!"
					});
					questionAnswer[msg.key.id] = response.data.answer;
					console.log(questionAnswer[msg.key.id])
					setTimeout(() => {
						if (questionAnswer[msg.key.id]) {
							conn.sendMessage(senderNumber, "Waktu habis!", MessageType.text, {
								quoted: msg
							});
							delete questionAnswer[msg.key.id];
						}
					}, 600 * 1000);

				}
			}
			break;
		}

		case `stickernobg`:
		case `stikernobg`:
		case `snobg`: {
			if (quotedMessage) {
				message.message = quotedMessage;
			}

			if (!message.message.imageMessage || message.message.imageMessage.mimetype != "image/jpeg") {
				conn.sendMessage(senderNumber, "Aduh gambarnya mana ya kak?, pastikan ada gambarnya atau reply sebuah gambar ya kak😉", MessageType.text, {
					quoted: message
				});
				break;
			}

			conn.sendMessage(senderNumber, 'Sedang di proses sabar ya kak. \n\ndiperikarakan sekitar 1 menit akan selesai maaf ya kak.', MessageType.text);

			const imagePath = await conn.downloadAndSaveMediaMessage(message);
			let output = Math.floor(Math.random() * 1000000);
			let outputPath = output.toString().concat("", ".png");

			const settings = {
				url: "https://api.clickmajic.com/v1/remove-background",
				sourceImagePath: imagePath,
				outputImagePath: outputPath
			};

			request.post(
				{
					url: settings.url,
					formData: { sourceFile: fs.createReadStream(settings.sourceImagePath), api_key: "da91f1a209fe88c68ad4cf2f571d4ed0" },
					encoding: null,
				},
				function (error, response, body) {
					if (error) { console.log(error); return; }
					if (response.statusCode != 200) { console.log(body.toString('utf8')); return; }
					fs.writeFileSync(settings.outputImagePath, body);
				}
			);

			const sticker = new WSF.Sticker(outputPath, {
				crop: false,
				pack: "sticker",
				author: stickerParameter
			});
			await sticker.build();
			const bufferImage = await sticker.get();
			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, {
				quoted: message
			});

			fs.unlinkSync(imagePath)
			fs.unlinkSync(outputPath);
			break;
		}

		case `bplanet`: {
			if (quotedMessage) message.message = quotedMessage
			if (!!parameter) {
				var [alias, ...text] = parameter.split` `
				text = text.join` `
				conn['sendMessage'](senderNumber, bahasa_planet(text, alias), 'conversation', {
					quoted: message
				})
			} else {
				var contoh = 'Inputnya salah kak 😅\n\nformat: !bplanet <alias> <text>\ncontoh: !bplanet g kamu lagi ngapain?'
				conn['sendMessage'](senderNumber, contoh, 'conversation', {
					quoted: message
				})
			}
			break;
		}

		case `lirik`:
		case `lyrics`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Kok lagunya nggak ada sih kak 🥺, silahkan diulangi ya", MessageType.text, {
					quoted: message
				});
				break;
			}

			const searches = await Client.songs.search(parameter);
			const firstSong = searches[0]

			if (!firstSong) {
				conn.sendMessage(senderNumber, `maaf kami tidak bisa menemukan lirik dari *${parameter}*😭  silahkan coba lagu yang lain`, MessageType.text, {
					quoted: message
				});
			} else {

				const lyrics = await firstSong.lyrics();
				const text = `lirik lagu *${firstSong.fullTitle}*\n\n${lyrics}`

				conn.sendMessage(senderNumber, text, MessageType.text, {
					quoted: message
				});
			}
			break;
		}

		case `gempa`: {
			const model = ['tr:nth-child(1) td'];
			fetch('https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg').then((res) => res.text()).then((body) => {
				let result = scrapy.extract(body, model);

				let waktu = result[1] || "Tidak ada data";
				let lintang = result[2] || "Tidak ada data";
				let bujur = result[3] || "Tidak ada data";
				let magnitudo = result[4] || "Tidak ada data";
				let kedalaman = result[5] || "Tidak ada data";
				let lokasi = result[6] || "Tidak ada data";

				const text = `informasi gempa terbaru:\n\nWaktu: *${waktu}*\nBujur: *${bujur}*\nLintang: *${lintang}*\nMagnitudo: *${magnitudo}*\nKedalaman: *${kedalaman}*\nLokasi: *${lokasi}*`;

				conn.sendMessage(senderNumber, text, MessageType.text, {
					quoted: message
				});
			});
			break;
		}

		case `ytmp3`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Link nya mana 😭", MessageType.text, {
					quoted: message
				});
				break;
			}

			const url = 'https://www.yt-download.org/api/button/mp3/';
			if (ytregex.test(parameter)) {

				conn.sendMessage(senderNumber, "Tunggu sebentar ya :3", MessageType.text, {
					quoted: message
				});

				var match = parameter.match(ytregex);
				var result = (match && match[7].length == 11) ? match[7] : false;
				var links = url + result;

				if (ytregex.test(parameter)) {

					conn.sendMessage(senderNumber, "Tunggu sebentar ya :3", MessageType.text, {
						quoted: message
					});

					var match = parameter.match(ytregex);
					var result = (match && match[7].length == 11) ? match[7] : false;
					var links = 'https://freerestapi.herokuapp.com/api/ytmp3?url=https://www.youtube.com/watch?v=' + result;

					request.get(links, { json: true }, (error, response, body) => {
						if (!error || response.statusCode == 200) {
							conn.sendMessage(senderNumber, `Audio kamu sudah siap di download\n*klik baca selengkanya sebelum klik link*\n\nJudul: *${body.title}*\nlink: ${body.url}`, MessageType.text, { quoted: message })
						} else {
							conn.sendMessage(senderNumber, "Maaf video yang kamu minta tidak bisa di download 😭", MessageType.text, { quoted: message });
						}
					})
				}

			} else {
				conn.sendMessage(senderNumber, "Sepertinya link yang kamu masukkan salah, silahkan coba link lainnya ya.", MessageType.text, {
					quoted: message
				});
			}
			break;
		}

		case `tl`:
		case `translate`: {

			if (!parameter) {
				conn.sendMessage(senderNumber, "Mau translate apa ya kak?", MessageType.text, {
					quoted: message
				})
			} else {
				const language = parameter.split(" ")[0];
				const text = parameter.split(" ").splice(1).join(" ");
				if (teslang.isSupported(language)) {

					translate(text, {
						to: language
					}).then(res => {
						let result = res;

						let texts = `*${result}*`;
						conn.sendMessage(senderNumber, texts, MessageType.text, {
							quoted: message
						});
					}).catch(err => {
						console.error(err);
					});
				} else {
					const buttons = [{
						buttonId: 'id1',
						buttonText: {
							displayText: '!kodebahasa',
						},
						type: 1
					}]

					const buttonMessage = {
						contentText: "Maaf kode bahasa salah atau mungkin kamu lupa memasukkan kode bahasa.",
						footerText: 'klik untuk mengetahui kode bahasa',
						buttons: buttons,
						headerType: 1
					}

					conn.sendMessage(senderNumber, buttonMessage, MessageType.buttonsMessage);
				}
			}
			break;
		}

		case `kodebahasa`: {
			const text = fs.readFileSync("./config/lang.txt", 'utf-8');
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});

			break;
		}
		case `yt`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Link nya mana 😭", MessageType.text, {
				});
				break;
			}

			if (ytregex.test(parameter)) {

				conn.sendMessage(senderNumber, "Tunggu sebentar ya :3", MessageType.text, {
					quoted: message
				});

				var match = parameter.match(ytregex);
				var result = (match && match[7].length == 11) ? match[7] : false;
				var links = 'https://freerestapi.herokuapp.com/api/ytmp4?url=https://www.youtube.com/watch?v=' + result;

				request.get(links, { json: true }, (error, response, body) => {
					if (!error || response.statusCode == 200) {
						conn.sendMessage(senderNumber, `Video kamu sudah siap di download\n\nJudul: *${body.title}*\nlink: ${body.url}`, MessageType.text, { quoted: message })
					} else {
						conn.sendMessage(senderNumber, "Maaf video yang kamu minta tidak bisa di download 😭", MessageType.text, { quoted: message });
					}
				})
			} else {
				conn.sendMessage(senderNumber, "Sepertinya link yang kamu masukkan salah, silahkan coba link lainnya ya.", MessageType.text, {
					quoted: message
				});
			}

			break;
		}
		default: {
			if (quotedMessage && questionAnswer[quotedMessageContext.stanzaId] && textMessage) {
				console.log(quotedMessage)
				console.log(parseInt(textMessage))
				const answer = questionAnswer[quotedMessageContext.stanzaId];
				console.log(answer);
				if (answer == parseInt(textMessage)) {
					conn.sendMessage(senderNumber, "Mantap Jiwa Jawaban kamu benar 😆🎊🎉", MessageType.text, {
						quoted: message
					});
					delete questionAnswer[quotedMessageContext.stanzaId];
				} else {
					conn.sendMessage(senderNumber, "Ups salah, coba lagi ya.", MessageType.text, {
						quoted: message
					})
				}
			}
		}

	}
}
