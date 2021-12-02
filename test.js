const fs = require("fs");
const axios = require("axios");
const scrapy = require('node-scrapy');
const PDFDocument = require("pdfkit");
const Genius = require("genius-lyrics");
const brainly = require("brainly-scraper-v2");
const translate = require('translate-google');

function kbbi(params) {

    const url = 'https://kbbi.kemdikbud.go.id/entri/';
    const model = {
        lema: 'h2',
        jenis: 'ol',
        arti: ['ol li', 'ul.adjusted-par'],
        makna: 'ul.adjusted-par li'
    }

    fetch(url + encodeURIComponent(params)).then((res) => res.text()).then((body) => {
        result = scrapy.extract(body, model);

        if (!result.arti) {
            return data = {
                lema: result.lema,
                jenis: result.jenis,
                arti: result.makna
            }
        } else if (result.arti !== 'undefined') {
            return data = {
                lema: result.lema,
                jenis: result.jenis,
                arti: result.arti
            }
        } else {
            return data = 'tidak ditemukan';
        }
    });
}

function lirik(params) {
    const searches = await Client.songs.search(params);
    const song = searches[0]

    if (!song) {
        return err = 'not found'
    } else {
        const lyrics = await firstSong.lyrics();

        return data = {
            title: firstSong.title,
            lyrics: lyrics
        }
    }
}

module.exports = kbbi, lirik;