const fs = require("fs");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const brainly = require("brainly-scraper");
const tesseract = require("node-tesseract-ocr");
const webpConverter = require("./lib/webpconverter.js")
const bahasa_planet = require('./lib/bahasa_planet')
const WSF = require("wa-sticker-formatter");
const zahir = require("zahir-api");
const {
	MessageType,
	Mimetype
} = require("@adiwajshing/baileys");
const {
	LatinKeAksara
} = require("@sajenid/aksara.js");
const inPdfInput = [];
const questionAnswer = {};
const bufferImagesForPdf = {};
const quotesList = JSON.parse(fs.readFileSync("lib/quotes.json", "utf-8"));
const factList = JSON.parse(fs.readFileSync("./lib/fact.json", "utf-8"));
const tmotList = JSON.parse(fs.readFileSync("./lib/tmot.json", "utf-8"));
const NLP = require('@hiyurigi/nlp')("TextCorrection");
const scrapy = require('node-scrapy');
const fetch = (...args) => import('node-fetch').then(({
	default: fetch
}) => fetch(...args));
const prefix = fs.readFileSync("./lib/prefix.txt", "utf-8");

let v = new NLP(["help", "contact", "stickernobg", "stikernobg", "stiker", "sticker", "snobg", "pdf", "bin", "binary", "hex", "aksara", "toimg", "togif", "textsticker", "donatur", "tmot", "giftextsticker", "gifsticker", "write", "tulis", "brainly", "quotes", "kbbi", "randomfact", "wikipedia", "yt", "math", "bplanet", "t"]);

module.exports = async (conn, message) => {
	const senderNumber = message.key.remoteJid;
	const imageMessage = message.message.imageMessage;
	const videoMessage = message.message.videoMessage;
	const stickerMessage = message.message.stickerMessage;
	const extendedTextMessage = message.message.extendedTextMessage;
	const quotedMessageContext = extendedTextMessage && extendedTextMessage.contextInfo && extendedTextMessage.contextInfo;
	const quotedMessage = quotedMessageContext && quotedMessageContext.quotedMessage;
	const textMessage = message.message.conversation || message.message.extendedTextMessage && message.message.extendedTextMessage.text || imageMessage && imageMessage.caption || videoMessage && videoMessage.caption

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

			let result = v.TextCorrection({
				Needle: d,
				Threshold: 0.7,
				NgramsLength: 1
			});
			f = result[0].Key;

			command = prefix.concat('', f);
		}

	}

	if (inPdfInput.includes(senderNumber)) {
		if (stickerMessage) return;
		if (command == `${prefix}done` || bufferImagesForPdf[senderNumber].length > 19) {
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

		} else if (command == `${prefix}cancel`) {
			delete bufferImagesForPdf[senderNumber];
			inPdfInput.splice(inPdfInput.indexOf(senderNumber), 1);
			conn.sendMessage(senderNumber, "Operasi dibatalkan!", MessageType.text, {
				quoted: message
			})

		} else if (imageMessage && imageMessage.mimetype == "image/jpeg") {
			const bufferImage = await conn.downloadMediaMessage(message);
			bufferImagesForPdf[senderNumber].push(bufferImage);

			conn.sendMessage(senderNumber, `[${bufferImagesForPdf[senderNumber].length}] Sukses menambah gambar!, kirim *${prefix}done* jika selesai, *!cancel* jika ingin membatalkan`, MessageType.text, {
				quoted: message
			})

		} else {
			conn.sendMessage(senderNumber, `Itu bukan gambar! kirim *${prefix}done* jika selesai, *${prefix}cancel* jika ingin membatalkan`, MessageType.text, {
				quoted: message
			})
		}

		return;
	}

	switch (command) {

		case `${prefix}t`: {
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


		case `${prefix}binary`:
		case `${prefix}bin`: {
			const bin = parameter.split('').map(function (char) {
				return char.charCodeAt(0).toString(2);
			}).join(' ');
			const text = `hasil konversi *${parameter}* ke Biner adalah\n\n*${bin}*`;

			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `${prefix}hex`: {
			let hexa = parameter.split('').map(function (char) {
				return char.charCodeAt(0).toString(16);
			}).join(' ');

			const text = `hasil konversi *${parameter}* ke Hexadesimal adalah:\n\n*${hexa}*`

			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `${prefix}help`:
		case `${prefix}menu`: {
			const text = fs.readFileSync("./lib/menu.txt", 'utf-8');

			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `${prefix}contact`: {
			const text = fs.readFileSync("./lib/contact.txt", "utf-8");
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}
		case `${prefix}donatur`: {
			const text = fs.readFileSync("./lib/donatur.txt", "utf-8");
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `${prefix}kbbi`: {
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
		case `${prefix}aksara`: {
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
		case `${prefix}sticker`:
		case `${prefix}stiker`: {
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
				author: 'EvA BOT'
			});
			await sticker.build();
			fs.unlinkSync(imagePath);
			const bufferImage = await sticker.get();
			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, {
				quoted: message
			});
			break;
		}

		case `${prefix}toimg`: {
			if (!quotedMessage || !quotedMessage.stickerMessage || quotedMessage.stickerMessage.mimetype != "image/webp") {
				conn.sendMessage(senderNumber, "Harus me-reply sticker :)", MessageType.text, {
					quoted: message
				});
				break;
			}

			message.message = quotedMessage;
			const webpImage = await conn.downloadMediaMessage(message);
			const jpgImage = await webpConverter.webpToJpg(webpImage);
			conn.sendMessage(senderNumber, jpgImage, MessageType.image, {
				quoted: message,
				caption: "Ini gambarnya kak!"
			});
			break;
		}


		case `${prefix}togif`: {
			if (!quotedMessage || !quotedMessage.stickerMessage || quotedMessage.stickerMessage.mimetype != "image/webp") {
				conn.sendMessage(senderNumber, "Harus me-reply sticker :)", MessageType.text, {
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

		case `${prefix}write`:
		case `${prefix}nulis`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Tidak ada text :)", MessageType.text, {
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

		case `${prefix}pdf`: {
			if (message.participant) {
				conn.sendMessage(senderNumber, "Demi menghindari spam fitur ini hanya tersedia di Private Chat", MessageType.text, {
					quoted: message
				});
				break;
			}

			if (imageMessage) {
				conn.sendMessage(senderNumber, "Kirim tanpa gambar!", MessageType.text, {
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

		case `${prefix}brainly`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Inputnya salah kak :)", MessageType.text, {
					quoted: message
				});
				break;
			}

			const data = await brainly(parameter);
			if (data.succses && data.data.length <= 0) {
				conn.sendMessage(senderNumber, "Pertanyaan tidak ditemukan :(", MessageType.text, {
					quoted: message
				})

			} else if (data.success) {
				for (const question of data.data.slice(0, 3)) {
					const text = `*Pertanyaan:* ${question.pertanyaan.trim()}\n\n*Jawaban*: ${question.jawaban[0].text.replace("Jawaban:", "").trim()}`
					await conn.sendMessage(senderNumber, text, MessageType.text, {
						quoted: message
					})
				}
			}
			break;
		}

		case `${prefix}quotes`: {
			const quotes = quotesList[Math.floor(Math.random() * quotesList.length)];
			const text = `_"${quotes.quote}"_\n\n - ${quotes.by}`;
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `${prefix}tmot`: {
			const mot = tmotList[Math.floor(Math.random() * tmotList.length)];
			const text = `_"${mot}"_`;
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `${prefix}randomfact`:
		case `${prefix}fact`: {
			const fact = factList[Math.floor(Math.random() * factList.length)];
			const text = `_${fact}_`
			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `${prefix}gtts`:
		case `${prefix}tts`:
		case `${prefix}text2sound`: {
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

		case `${prefix}wikipedia`:
		case `${prefix}wiki`: {
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

		case `${prefix}textsticker`:
		case `${prefix}textstiker`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Inputnya salah kak :)", MessageType.text, {
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
				author: 'EvA BOT'
			});
			await sticker.build();
			const bufferImage = await sticker.get();
			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, {
				quoted: message
			});
			break;
		}

		case `${prefix}ocr`: {
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
			const textImage = (await tesseract.recognize(imagePath)).trim();
			fs.unlinkSync(imagePath)

			conn.sendMessage(senderNumber, textImage, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `${prefix}gifsticker`: {
			if (quotedMessage) {
				message.message = quotedMessage;
			}

			if (!message.message.videoMessage || message.message.videoMessage.mimetype != "video/mp4") {
				conn.sendMessage(senderNumber, "Tidak ada video :)", MessageType.text, {
					quoted: message
				});
				break;
			}

			if (message.message.videoMessage.seconds > 8) {
				conn.sendMessage(senderNumber, "Maksimal 8 detik!", MessageType.text, {
					quoted: message
				});
				break;
			}

			const imagePath = await conn.downloadAndSaveMediaMessage(message, Math.floor(Math.random() * 1000000));
			const sticker = new WSF.Sticker("./" + imagePath, {
				animated: true,
				pack: "STIKER",
				author: 'EvA BOTS'
			});
			await sticker.build();
			fs.unlinkSync(imagePath);
			const bufferImage = await sticker.get();
			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, {
				quoted: message
			});
			break;
		}

		case `${prefix}giftextsticker`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Inputnya salah kak :)", MessageType.text, {
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


		case `${prefix}math`: {
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

			setTimeout(() => {
				if (questionAnswer[msg.key.id]) {
					conn.sendMessage(senderNumber, "Waktu habis!", MessageType.text, {
						quoted: msg
					});
					delete questionAnswer[msg.key.id];
				}
			}, 600 * 1000);
			break;
		}

		case `${prefix}stickernobg`:
		case `${prefix}stikernobg`:
		case `${prefix}snobg`: {
			if (quotedMessage) {
				message.message = quotedMessage;
			}

			if (!message.message.imageMessage || message.message.imageMessage.mimetype != "image/jpeg") {
				conn.sendMessage(senderNumber, "Tidak ada gambar :)", MessageType.text, {
					quoted: message
				});
				break;
			}

			const image = await conn.downloadMediaMessage(message);
			const imageb64 = image.toString('base64')
			conn.sendMessage(senderNumber, 'Tunggu ya kak!', MessageType.text);
			const data = await axios.post('https://salisganteng.pythonanywhere.com/api/remove-bg', {
				'api-key': 'salisheker',
				'image': imageb64,
			})

			const sticker = new WSF.Sticker(data.data.image, {
				crop: false,
				pack: "sticker",
				author: 'EvA BOTS'
			});
			await sticker.build();
			const bufferImage = await sticker.get();
			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, {
				quoted: message
			});
			break;
		}

		/**
		 * Konversi bahasa planet
		 * use: !bplanet g kamu lagi ngapain
		 * result: kagamugu lagagigi ngagapagaigin
		 **/
		case `${prefix}bplanet`: {
			if (quotedMessage) message.message = quotedMessage
			if (!!parameter) {
				var [alias, ...text] = parameter.split ` `
				text = text.join ` `
				conn['sendMessage'](senderNumber, bahasa_planet(text, alias), 'conversation', {
					quoted: message
				})
			} else {
				var contoh = '[wrong format]\n\nformat: !bplanet <alias> <text>\ncontoh: !bplanet g kamu lagi ngapain?'
				conn['sendMessage'](senderNumber, contoh, 'conversation', {
					quoted: message
				})
			}
		}

		case `${prefix}chord`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Jangan lupa masukkan judul lagunnya ya kak :3", MessageType.text, {
					quote: message
				});
			} else {
				const text = zahir.Other.ChordLagu(parameter);

				conn.sendMessage(senderNumber, text, MessageType.text, {
					quote: message
				});
			}
			break;
		}
		case `${prefix}lirik`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Jangan lupa masukkan judul lagunnya ya kak :3", MessageType.text, {
					quote: message
				});
			} else {
				const text = zahir.Other.LirikLagu(parameter);

				conn.sendMessage(senderNumber, text, MessageType.text, {
					quote: message
				});
			}
			break;
		}

		case `${prefix}gempa`: {
			const text = zahir.Edukasi.Gempa()

			conn.sendMessage(senderNumber, text, MessageType.text, {
				quoted: message
			});
			break;
		}

		case `${prefix}yt`: {
			if (!parameter) {
				conn.sendMessage(senderNumber, "Link nya mana 😭", MessageType.text, {
					quoted: message
				});
				break;
			}

			const url = 'https://www.yt-download.org/api/button/videos/';
			var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;

			if (regExp.test(parameter)) {

				conn.sendMessage(senderNumber, "Tunggu sebentar ya :3", MessageType.text, {
					quoted: message
				});

				var match = parameter.match(regExp);
				var result = (match && match[7].length == 11) ? match[7] : false;
				var links = url + result;

				const model = {
					link: ['a.shadow-xl (href)'],
					quality: ['div.text-shadow-1'],
				};

				fetch(links).then((res) => res.text()).then((body) => {
					let result = scrapy.extract(body, model);
					console.log(result.link);
					if (result.link == null) {
						conn.sendMessage(senderNumber, "Aduh😭, videonya gabisa diunduh, mungkin video kamu mengandung batasa seperti 18+, Video Pribadi atau diblokir di negaramu 🥲. \n\nAlternatifnya gunakan video lain yang serupa dan tidak memiliki batasan misalnya video reupload👀.", MessageType.text, {
							quoted: message
						});
					} else {
						//start second if else

						let thelink = result.link;
						let info1 = result.quality[1].replace(/\s+/g, '') + " " + result.quality[2];
						if (result.quality.length < 4) {
							const text = `Videomu sudah siap diunduh, silahkan pilih resolusi dan klik link yang tersedia untuk memulai pengunduhan\n\n*${info1}* : ${thelink}`;
							conn.sendMessage(senderNumber, text, MessageType.text, {
								quoted: message
							});
						} else {

							let info2 = result.quality[4].replace(/\s+/g, '') + " " + result.quality[5];

							const text = `Videomu sudah siap diunduh, silahkan pilih resolusi dan klik link yang tersedia untuk memulai pengunduhan\n\n*${info1}* : ${thelink[0]}\n\n*${info2}* : ${thelink[1]}`;

							conn.sendMessage(senderNumber, text, MessageType.text, {
								quoted: message
							});
						}
						// end second if else
					}
				});

			} else {
				conn.sendMessage(senderNumber, "Sepertinya link yang kamu masukkan salah, silahkan coba link lainnya ya.", MessageType.text, {
					quoted: message
				});
			}
		}

		break
	default: {
		if (quotedMessage && questionAnswer[quotedMessageContext.stanzaId] && textMessage) {
			const answer = questionAnswer[quotedMessageContext.stanzaId];
			if (answer == parseInt(textMessage)) {
				conn.sendMessage(senderNumber, "Keren! jawaban benar", MessageType.text, {
					quoted: message
				});
				delete questionAnswer[quotedMessageContext.stanzaId];
			} else {
				conn.sendMessage(senderNumber, "Jawaban salah!", MessageType.text, {
					quoted: message
				})
			}
		}
	}

	}
}