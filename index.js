/* WA BOTS
 * 
 * Common error selalu meminta kode QR: 
 * pergi ke view-source               : https: //web.whatsapp.com
 * 
 * cari tag ini 
 *
 * <meta name = "binary-transparency-manifest-key" content = "x.xxxx.xx"/>
 *
 * ganti version di kode dibawah dengan isi dari "content"
 *
 */

const fs                     = require("fs");
const http                   = require("http");
const axios                  = require("axios");
const qrcode                 = require("qrcode");
const messageHandler         = require("./messageHandler.js");
const { WAConnection }       = require("@adiwajshing/baileys");
const conn                   = new WAConnection();
      conn.maxCachedMessages = 15;

const server = http.createServer((req, res) => {
	if (req.url == "/") {
		res.end(fs.readFileSync("templates/index.html", "utf-8"));
	} else {
		res.end("404");
	}
})

const io = require("socket.io")(server);
io.on("connection", (socket) => {
	conn.on("qr", async (qr) => {
		const imgURI = await qrcode.toDataURL(qr);
		socket.emit("qr", imgURI);
	});

	conn.on("open", () => {
		socket.emit("connected");
	});
})


server.listen(process.env.PORT || 3000);

conn.on("chat-update", async (message) => {
	try {
		if (!message.hasNewMessage) return;
		message = message.messages.all()[0];
		if (!message.message || message.key.fromMe || message.key && message.key.remoteJid == 'status@broadcast') return;
		if (message.message.ephemeralMessage) {
			message.message = message.message.ephemeralMessage.message;
		}
		
		await messageHandler(conn, message);
	} catch(e) {
		console.log("[ERROR] " + e.message);
		
		let theError = ""

		if(e.message == "Cannot read properties of undefined (reading 'Key')"){
			theError = "Perintah tidak ditemukan";
		}else{
			theError = e.message;
		}

		conn.sendMessage(message.key.remoteJid, `Aduh maaf ya perintah yang kamu kirim tidak tersedia atau mungkin terjadi error😭\n\n\nError log:\u0060\u0060\u0060\n${theError}\u0060\u0060\u0060`, "conversation", { quoted: message });
	}
});

const start = async () => {

	// ganti jika terus meminta kode QR
	conn.version = [2,2142,12];

	if (fs.existsSync("login.json")) conn.loadAuthInfo("login.json");
	conn.connect()
		.then(() => {
			fs.writeFileSync("login.json", JSON.stringify(conn.base64EncodedAuthInfo()));
			console.log("[OK] Login sukses! kirim !help untuk menampilkan perintah");
		})
		.catch(e => {
			if (fs.existsSync("login.json")) fs.unlinkSync("login.json");
			console.log("[ERROR] Login gagal!");
			conn.clearAuthInfo();
			start();
		});
}

start();
