pkg install nodejs-lts git tesseract libwebp wget imagemagick ffmpeg -y
wget https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/master/ind.traineddata
mv ind.traineddata /data/data/com.termux/files/usr/share/tessdata 
npm install -g pnpm
pnpm install
