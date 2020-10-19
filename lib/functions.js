const { default: got } = require('got/dist/source');
const fetch = require('node-fetch')
const { getBase64 } = require("./fetcher")
const request = require('request')
const emoji = require('emoji-regex')
const fs = require('fs-extra')
const cheerio = require('cheerio');
const qs = require('qs');

async function getZoneStatus (latitude, longitude, userId = '2d8ecc70-8310-11ea-84f8-13de98afc5a4') {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: {
                Authorization: 'Basic dGVsa29tOmRhMWMyNWQ4LTM3YzgtNDFiMS1hZmUyLTQyZGQ0ODI1YmZlYQ== ',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                userId
            })
        }
        fetchJson('https://api.pedulilindungi.id/zone/v1', options)
            .then(json => {
                const result = {
                    kode: json.data.zone,
                    status: '',
                    optional: ''
                }

                switch (json.data.zone) {
                case 'red':
                    result.status = 'anda berada di Zona Merah penyebaran COVID-19.'
                    result.optional = 'Zona Merah adalah area yang sudah terdapat kasus Positif COVID-19.'
                    break
                case 'yellow':
                    result.status = 'anda berada di Zona Kuning penyebaran COVID-19.'
                    result.optional = 'Zona Kuning adalah area yang sudah terdapat kasus ODP atau PDP COVID-19.'
                    break
                case 'green':
                    result.status = 'anda berada di Zona Hijau penyebaran COVID-19.'
                    result.optional = 'Zona Hijau adalah area yang belum terdapat kasus PDP atau Positif COVID-19.'
                    break
                }

                if (!json.success && json.message == 'Anda berada di zona aman.') {
                    result.kode = 'green'
                    result.status = 'anda berada di Zona Hijau penyebaran COVID-19.'
                    result.optional = 'Zona Hijau adalah area yang belum terdapat kasus PDP atau Positif COVID-19.'
                }
                resolve(result)
            })
            .catch((err) => reject(err))
    })
}

async function getArea (latitude, longitude, size = 10) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                Authorization: ' Basic dGVsa29tOmRhMWMyNWQ4LTM3YzgtNDFiMS1hZmUyLTQyZGQ0ODI1YmZlYQ== ',
                'Content-Type': ' application/json '
            }
        }
        fetchJson(`https://api.pedulilindungi.id/zone/v1/location/area?latitude=${latitude}&longitude=${longitude}&page=1&size=${size}`, options)
            .then(json => {
                if (json.success && json.code == 200) resolve(json)
            })
            .catch((err) => reject(err))
    })
};

module.exports = getLocationData = async (latitude, longitude) => {
    try {
        const responses = await Promise.all([getZoneStatus(latitude, longitude), getArea(latitude, longitude)])
        const result = {
            kode: 200,
            status: responses[0].status,
            optional: responses[0].optional,
            data: []
        }
        responses[1].data.map((x) => result.data.push(x))
        return result
    } catch (err) {
        console.log(err)
        return { kode: 0 }
    }
}
const ramalanCinta = (n1, t1, n2, t2) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve, reject) => {
    const data = qs.stringify({
      nama1: n1,
      tanggal1: t1.split('-')[0],
      bulan1: t1.split('-')[1],
      tahun1: t1.split('-')[2],
      nama2: n2,
      tanggal2: t2.split('-')[0],
      bulan2: t2.split('-')[1],
      tahun2: t2.split('-')[2],
      submit: '+Submit!+',
    });
    const config = {
      method: 'post',
      url: 'http://www.primbon.com/ramalan_cinta.php',
      data,
    };
    axios(config)
      .then((response) => {
        const $ = cheerio.load(response.data);
        let text = `*${$('#body > b:nth-child(1)').text()}*\n\n`;
        text += `*${$('#body > b:nth-child(4)').text()}*\n`;
        text += `${$('#body').contents()[9].data}\n\n`;
        text += `*${$('#body > b:nth-child(8)').text()}*\n`;
        text += `${$('#body').contents()[15].data}\n\n`;
        text += `*${$('#body > b:nth-child(12)').text()}*${$('#body').contents()[20].data}\n`;
        text += `*${$('#body > b:nth-child(14)').text()}*${$('#body').contents()[23].data}\n\n`;
        text += `${$('#body').contents()[29].data.trim()}`;
        // console.log(result);
        resolve(text);
      })
      .catch((error) => reject(error));
  });
/**
 * Get meme from random subreddit
 *
 * @param  {String} subreddit
 * @return  {Promise} Return meme from dankmemes, wholesomeanimemes, wholesomememes, AdviceAnimals, MemeEconomy, memes, terriblefacebookmemes, teenagers, historymemes
 */
const randommeme = (subreddit) => new Promise((resolve, reject) => {
    const subreddits = ['dankmemes', 'wholesomeanimemes', 'wholesomememes', 'AdviceAnimals', 'MemeEconomy', 'memes', 'terriblefacebookmemes', 'teenagers', 'historymemes']
    const randSub = subreddits[Math.random() * subreddits.length | 0]
    console.log('looking for memes on ' + randSub)
    fetchJson('https://meme-api.herokuapp.com/gimme/' + randSub)
        .then((result) => resolve(result))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

/**
 * create custom meme
 * @param  {String} imageUrl
 * @param  {String} topText
 * @param  {String} bottomText
 */
const custommeme = async (imageUrl, top, bottom) => new Promise((resolve, reject) => {
    topText = top.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\#/g, '~h').replace(/\//g, '~s')
    bottomText = bottom.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\#/g, '~h').replace(/\//g, '~s')
    fetchBase64(`https://api.memegen.link/images/custom/${topText}/${bottomText}.png?background=${imageUrl}`, 'image/png')
        .then((result) => resolve(result))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})
const liriklagu = async (lagu) => {
    const response = await fetch(`http://scrap.terhambar.com/lirik?word=${lagu}`)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status === true) return `Lirik Lagu ${lagu}\n\n${json.result.lirik}`
    return `[ Error ] Lirik Lagu ${lagu} tidak di temukan!`
}
const tweet = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    twtGetInfo(url, {})
        .then((content) => resolve(content))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})
const quotemaker = async (quotes, author = 'EmditorBerkelas', type = 'random') => {
    var q = quotes.replace(/ /g, '%20').replace('\n','%5Cn')
    const response = await fetch(`https://terhambar.com/aw/qts/?kata=${q}&author=${author}&tipe=${type}`)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    const json = await response.json()
    if (json.status) {
        if (json.result !== '') {
            const base64 = await getBase64(json.result)
            return base64
        }
    }
}

const emojiStrip = (string) => {
    return string.replace(emoji, '')
}
const tiktok = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    getVideoMeta(url, { noWaterMark: true, hdVideo: true })
        .then(async (result) => {
            console.log('Get Video From', '@' + result.authorMeta.name, 'ID:', result.id)
            if (result.videoUrlNoWaterMark) {
                result.url = result.videoUrlNoWaterMark
                result.NoWaterMark = true
            } else {
                result.url = result.videoUrl
                result.NoWaterMark = false
            }
            resolve(result)
        }).catch((err) => {
            console.error(err)
            reject(err)
        })
})
const fb = async (url) => {
    const response = await fetch(`http://scrap.terhambar.com/fb?link=${url}`)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    const json = await response.json()
    if (json.status === true) return {
        'capt': json.result.title, 'exts': '.mp4', 'url': json.result.linkVideo.sdQuality
    }
    return {
        'capt': '[ ERROR ] Not found!', 'exts': '.jpg', 'url': 'https://c4.wallpaperflare.com/wallpaper/976/117/318/anime-girls-404-not-found-glowing-eyes-girls-frontline-wallpaper-preview.jpg'
    }
}

const ss = async(query) => {
    request({
        url: "https://api.apiflash.com/v1/urltoimage",
        encoding: "binary",
        qs: {
            access_key: "2fc9726e595d40eebdf6792f0dd07380",
            url: query
        }
    }, (error, response, body) => {
        if (error) {
            console.log(error);
        } else {
            fs.writeFile("./media/img/screenshot.jpeg", body, "binary", error => {
                console.log(error);
            })
        }
    })
}

const randomNimek = async (type) => {
    var url = 'https://api.computerfreaker.cf/v1/'
    switch(type) {
        case 'nsfw':
            const nsfw = await fetch(url + 'nsfwneko')
            if (!nsfw.ok) throw new Error(`unexpected response ${nsfw.statusText}`)
            const resultNsfw = await nsfw.json()
            return resultNsfw.url
            break
        case 'hentai':
            const hentai = await fetch(url + 'hentai')
            if (!hentai.ok) throw new Error(`unexpected response ${hentai.statusText}`)
            const resultHentai = await hentai.json()
            return resultHentai.url
            break
        case 'anime':
            let anime = await fetch(url + 'anime')
            if (!anime.ok) throw new Error(`unexpected response ${anime.statusText}`)
            const resultNime = await anime.json()
            return resultNime.url
            break
        case 'neko':
            let neko = await fetch(url + 'neko')
            if (!neko.ok) throw new Error(`unexpected response ${neko.statusText}`)
            const resultNeko = await neko.json()
            return resultNeko.url
            break
        case 'trap':
            let trap = await fetch(url + 'trap')
            if (!trap.ok) throw new Error(`unexpected response ${trap.statusText}`)
            const resultTrap = await trap.json()
            return resultTrap.url
            break
    }
}

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getZodiak = (nama, tgl) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve, reject) => {
    // console.log(`${nama} - ${tgl}`);
    axios
      .get(`https://script.google.com/macros/exec?service=AKfycbw7gKzP-WYV2F5mc9RaR7yE3Ve1yN91Tjs91hp_jHSE02dSv9w&nama=${nama}&tanggal=${tgl}`)
      .then((response) => {
        // console.log(response.data);
        // eslint-disable-next-line object-curly-newline
        const { lahir, usia, ultah, zodiak } = response.data.data;
        let text = `*Nama*: ${nama}\n`;
        text += `*Lahir*: ${lahir}\n`;
        text += `*Usia*: ${usia}\n`;
        text += `*Ultah*: ${ultah}\n`;
        text += `*Zodiak*: ${zodiak}`;
        resolve(text);
      })
      .catch((error) => reject(error));
  });


const jadwalTv = async (query) => {
    const res = await got.get(`https://api.haipbis.xyz/jadwaltv/${query}`).json()
    if (res.error) return res.error
    switch(query) {
        case 'antv':
            return `\t\t[ ANTV ]\n${res.join('\n')}`
            break
        case 'gtv':
            return `\t\t[ GTV ]\n${res.join('\n')}`
            break
        case 'indosiar':
            return `\t\t[ INDOSIAR ]\n${res.join('\n')}`
            break
        case 'inewstv':
            return `\t\t[ iNewsTV ]\n${res.join('\n')}`
            break
        case 'kompastv':
            return `\t\t[ KompasTV ]\n${res.join('\n')}`
            break
        case 'mnctv':
            return `\t\t[ MNCTV ]\n${res.join('\n')}`
            break
        case 'metrotv':
            return `\t\t[ MetroTV ]\n${res.join('\n')}`
            break
        case 'nettv':
            return `\t\t[ NetTV ]\n${res.join('\n')}`
            break
        case 'rcti':
            return `\t\t[ RCTI ]\n${res.join('\n')}`
            break
        case 'sctv':
            return `\t\t[ SCTV ]\n${res.join('\n')}`
            break
        case 'rtv':
            return `\t\t[ RTV ]\n${res.join('\n')}`
            break
        case 'trans7':
            return `\t\t[ Trans7 ]\n${res.join('\n')}`
            break
        case 'transtv':
            return `\t\t[ TransTV ]\n${res.join('\n')}`
            break
        default:
            return '[ ERROR ] Channel TV salah! silahkan cek list channel dengan mengetik perintah *!listChannel*'
            break
    }
}

exports.liriklagu = liriklagu;
exports.quotemaker = quotemaker;
exports.randomNimek = randomNimek
exports.fb = fb;
exports.emojiStrip = emojiStrip;
exports.sleep = sleep;
exports.jadwalTv = jadwalTv;
exports.ss = ss;
exports.tiktok = tiktok;
exports.tweet = tweet;
exports.custommeme = custommeme;
exports.randommeme = randommeme;
exports.ramalanCinta = ramalanCinta;
exports.getZodiak = getZodiak;
exports.getLocationData = getLocationData;