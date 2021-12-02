<p align="center">
  <img src="https://i.ibb.co/RvpWB5P/IMG-20211119-155520.png" width=500/>
</p>
<br>

<div align="center">
   <h3>
     Easy customization WhatsApp Bot With <a href="https://github.com/adiwajshing/Baileys">Baileys</a>
   </h3>
</div> 
<br>

### 🔧 Pengaturan pengguna
Ubah prefix di ```lib/prefix.txt``` <br>
Ubah owner di ```lib/contact.txt``` <br>
Ubah donatur di ```lib/donatur.txt```<br>

Sengaja dipisah dan tidak dibuat ```.json``` agar kalian makin mudah untuk mengotak-atik


### 📱 Termux
Install package
````
pkg install nodejs-lts git tesseract libwebp wget imagemagick ffmpeg
````
Clone repository ini
````
git clone https://github.com/evaasmakula/bots
````
Install ini jika ingin menggunakan OCR
````
wget https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/master/ind.traineddata
mv ind.traineddata /data/data/com.termux/files/usr/share/tessdata 
````
install semua package yang dibutuhkan dan jalankan
````
npm install && node .
````
note: jika npm error gunakan pnpm 
````
npm install -g pnpm && pnpm install 
````

atau kalian juga bisa langsung menjalankan script instalasinya dengan
menjalankan ```install.sh```
````
bash install.sh
````

### 🐧 Install di Linux (ubuntu & debian)
```
sudo apt install npm git webp imagemagick ffmpeg
sudo apt install tesseract-ocr tesseract-ocr-ind
sudo npm install -g n
sudo n stable
cd whatsapp-bot
npm install
node index.js
```

### 🤖 fitur
- convert gambar ke sticker
- convert gambar ke sticker tanpa background
- convert text ke sticker
- convert text ke gif sticker
- convert video ke sticker
- convert sticker ke gambar
- convert sticker ke gif
- convert gambar ke pdf
- nulis
- brainly
- ocr
- KBBI
- Yt downloaders
- Gempa
- Lyrics finder
- Convert to Hex & Binary
- Google Translate
- quotes random
- fakta random
- text to sound
- wikipedia
- soal matematika
- bahasa planet

### 🤓 Autocorrect
Bot sudah dilengkapi fitur autocorrect perintah (beta) dan akan ditingkatkan lagi akurasinya
Untuk test autocorrect silahkan gunakan ```(prefix)t perintah``` contoh ```!t kbbl```. Akan menjadi ```!kbbi```
Console log:
````
[
  { Key: 'kbbi', Text: [ 'k', 'b', 'b', 'i' ], similarity: 1 },
  { Key: 'ytmp3', Text: [ 'k', 't', 'm', 'p' ], similarity: 0.6 },
  { Key: 'help', Text: [ 'h', 'b', 'b', 'p' ], similarity: 0.5 },
  { Key: 'menu', Text: [ 'k', 'b', 'n', 'u' ], similarity: 0.5 },
  { Key: 'yt', Text: [ 'k', 't', 'b', 'i' ], similarity: 0.5 },
  { Key: 'lirik', Text: [ 'l', 'b', 'b', 'i' ], similarity: 0.4 },
  { Key: 'gempa', Text: [ 'k', 'b', 'm', 'p' ], similarity: 0.4 },
  { Key: 'togif', Text: [ 'k', 'b', 'g', 'i' ], similarity: 0.4 }
]
````
