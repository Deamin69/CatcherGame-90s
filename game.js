const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

let oikeaPainettu = false;
let vasenPainettu = false;


let koriX = 210;
let koriY = 290;

let koriLeveys = 60;
let koriKorkeus = 20;
let koriNopeus = 7;

let esineX = 240;
let esineY = 0;
let esineSade = 10;
let esineNopeus = 3;

let pisteet = 0;
let missit = 0;
let maksimiMissit = 3;
let pelikaynnissa = false;
let peliAloitettu = false;
let taso = 0;
let aanetPaalla = true;
let uusiEnnatysEfektiKoko = 1;
let paivitettyUusiEnnatys = false;
let uusiEnnatysAjastin = 0;

let taustaMusiikkiAjastin = null;

const melodia = [
    // Osa 1: A-molli nousu
    { freq: 220, kesto: 0.2 }, //A3
    { freq: 262, kesto: 0.2 }, //C4
    { freq: 330, kesto: 0.2 }, //E4
    { freq: 440, kesto: 0.2 }, //A4
    { freq: 330, kesto: 0.2 }, //E4
    { freq: 262, kesto: 0.2 }, //C4

    // Osa 2: F-duuri kierto
    { freq: 175, kesto: 0.2 }, //F3
    { freq: 220, kesto: 0.2 }, //A3
    { freq: 262, kesto: 0.2 }, //C4
    { freq: 349, kesto: 0.2 }, //F4
    { freq: 262, kesto: 0.2 }, //C4
    { freq: 220, kesto: 0.2 }, //A3

    // Osa 3: C-duuri kierto
    { freq: 131, kesto: 0.2 }, //C3
    { freq: 262, kesto: 0.2 }, //C4
    { freq: 330, kesto: 0.2 }, //E4
    { freq: 392, kesto: 0.2 }, //G4
    { freq: 330, kesto: 0.2 }, //E4
    { freq: 362, kesto: 0.2 }, //C4

    // Osa4: G-duuri huipennus
    { freq: 196, kesto: 0.2 }, //G3
    { freq: 247, kesto: 0.2 }, //B3
    { freq: 294, kesto: 0.2 }, //D4
    { freq: 392, kesto: 0.2 }, //G4
    { freq: 294, kesto: 0.2 }, //D4
    { freq: 247, kesto: 0.2 }  //B3

];

let melodiaIndeksi = 0;

let parastulos = localStorage.getItem("parastulos") || 0;

//Pelin äänet
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function alustaAani() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

["keydown", "click", "touchstart"].forEach(event => {
    window.addEventListener(event, alustaAani, {
        once: false
    });
});

function soitaTaustaMusiikki() {
    if (!aanetPaalla) return;
    alustaAani();
    if (!audioCtx) return;

    const nuotti = melodia[melodiaIndeksi];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(nuotti.freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.018, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + nuotti.kesto);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + nuotti.kesto);

    melodiaIndeksi = (melodiaIndeksi + 1) % melodia.length;
}

function soitaOsumaAani() {
    if (!aanetPaalla) return;

    alustaAani();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

function soitaHavioAani() {
    if (!aanetPaalla) return;

    alustaAani();
    if (!audioCtx) return;

    const taajuudet = [220, 196, 174, 130];
    const nuotinKesto = 0.12;

    taajuudet.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sawtooth";

        const AloitusAika = audioCtx.currentTime + (idx * nuotinKesto);
        osc.frequency.setValueAtTime(freq, AloitusAika);

        if (idx === taajuudet.length - 1) {
            osc.frequency.exponentialRampToValueAtTime(50, AloitusAika + 0.6);
            gain.gain.setValueAtTime(0.18, AloitusAika);
            gain.gain.exponentialRampToValueAtTime(0.01, AloitusAika + 0.6);
            osc.start(AloitusAika);
            osc.stop(AloitusAika + 0.6);
        }
        else {
            gain.gain.setValueAtTime(0.15, AloitusAika);
            gain.gain.exponentialRampToValueAtTime(0.01, AloitusAika + nuotinKesto);
            osc.start(AloitusAika);
            osc.stop(AloitusAika + nuotinKesto);
        }

        osc.connect(gain);
        gain.connect(audioCtx.destination);
    });
}

function soitaOhiAani() {
    if (!aanetPaalla) return;

    alustaAani();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

// Liikkuvat tähdet
const tahdet = Array.from({ length: 30 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    koko: Math.random() > 0.6 ? 2 : 1,
    nopeus: Math.random() * 0.5 + 0.2
}));

document.addEventListener("keydown", function (e) {
    if (e.key == "ArrowRight") {
        oikeaPainettu = true;
    } else if (e.key == "ArrowLeft") {
        vasenPainettu = true;
    }
});

document.addEventListener("keyup", function (e) {
    if (e.key == "ArrowRight") {
        oikeaPainettu = false;
    } else if (e.key == "ArrowLeft") {
        vasenPainettu = false;
    }
});

document.addEventListener("keydown", function (e) {
    alustaAani();
    if (e.key.toLowerCase() === "m") {
        aanetPaalla = !aanetPaalla;
    }

    if (e.key == " " && pelikaynnissa == false) {
        e.preventDefault();
        peliAloitettu = true;

        pisteet = 0;
        missit = 0;
        taso = 0;
        esineNopeus = 3;
        koriNopeus = 7;
        paivitettyUusiEnnatys = false;
        uusiEnnatysAjastin = 0;

        //Palkin keskittäminen
        koriX = (canvas.width - koriLeveys) / 2;

        //Palautetaan pallo ylös satunnaiseen kohtaan
        esineY = 0;
        esineX = Math.random() * (canvas.width - esineSade * 2) + esineSade;

        pelikaynnissa = true;

        if (taustaMusiikkiAjastin) clearInterval(taustaMusiikkiAjastin);
        melodiaIndeksi = 0;
        taustaMusiikkiAjastin = setInterval(soitaTaustaMusiikki, 360);

    }
});

canvas.addEventListener("pointerdown", function (e) {
    const rect = canvas.getBoundingClientRect();
    const kosketusX = e.clientX - rect.left;
    const kosketusY = e.clientY - rect.top;

    if (kosketusX > canvas.width - 160 && kosketusY < 40) {
        aanetPaalla = !aanetPaalla;
    }
});

//Piirtofunktio
function piirraTahdet() {
    context.fillStyle = "#ffffff";
    tahdet.forEach(tahti => {
        context.fillRect(tahti.x, tahti.y, tahti.koko, tahti.koko);
        tahti.y += tahti.nopeus;

        //Jos tähti riistyy reunan yli, se siirtyy yakaisin ylös
        if (tahti.y > canvas.height) {
            tahti.y = 0;
            tahti.x = Math.random() * canvas.width;
        }
    });
}

//Kehys
function PiirraNeonKehys() {
    context.save();
    context.strokeStyle = "#f4a261";
    context.lineWidth = 4;
    context.shadowBlur = 12;
    context.shadowColor = "#f4a261";
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    context.restore();
}

function aloitaUusiPeli() {
    pisteet = 0;
    missit = 0;
    pudotusNopeus = 2;
    koriX = canvas, width / 2 - koriLeveys / 2;

    esineY = 0;
    esineX = Math.random() * (canvas.width - esineSade * 2) + esineSade;

    peliAloitettu = true;
    pelikaynnissa = true;
}

function gameLoop() {
    if (pelikaynnissa == false) {
        piirraTahdet();

        // Etusivun tausta
        context.fillStyle = "rgba(16, 20, 41, 0.85)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        //Animaatiolaskuri
        const aika = Date.now() * 0.003;
        const hohtoSyke = Math.sin(aika) * 6 + 14;
        const vilkkuu = Math.floor(Date.now() / 400) % 2 === 0;


        if (!peliAloitettu) {
            context.save();
            context.textAlign = "center";
            context.font = "bold 25px 'Courier New', monospace";
            context.fillStyle = "#e76f51";
            context.fillText("RETRO CATCHER '90", canvas.width / 2 + 2, canvas.height / 2 - 43);

            //Pääotsikkko

            context.fillStyle = "#70d6ff";
            context.shadowBlur = hohtoSyke;
            context.shadowColor = "#70d6ff";
            context.fillText("RETRO CATCHER '90", canvas.width / 2, canvas.height / 2 - 45);
            context.restore();

            context.save();
            context.strokeStyle = "#e9c46a";
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(canvas.width / 2 - 110, canvas.height / 2 - 32);
            context.lineTo(canvas.width / 2 + 110, canvas.height / 2 - 32);
            context.stroke();
            context.restore();

            // Paras tulos
            context.save();
            context.textAlign = "center";
            context.font = "12px 'Courier New', monospace";
            context.fillStyle = "#e9c46a";
            context.fillText(`✨ PARAS TULOS: ${parastulos} ✨`, canvas.width / 2, canvas.height / 2 - 10);
            context.restore();

            // Vilkkuva "Paina välilyöntiä"
            if (vilkkuu) {
                context.save();
                context.textAlign = "center";
                context.font = "bold 13px 'Courier New', monospace";
                context.fillStyle = "#f4a261";
                context.shadowBlur = 10;
                context.shadowColor = "#f4a261";
                context.fillText("PAINA VÄLILYÖNTIÄ ALOITTAAKSESI!", canvas.width / 2, canvas.height / 2 + 30);
                context.restore();
            }
            // Näppäinohjeet
            context.save();
            context.textAlign = "center";
            context.font = "10px 'Courier New', monospace";
            context.fillStyle = "#a0a0b0";
            context.fillText(" [◄] [►] Liikuta koria | [M] Äänet On/Off", canvas.width / 2, canvas.height / 2 + 75);
            context.restore();

        }
        //Game Over
        else {
            context.save();
            context.fillStyle = "#e9c46a";
            context.font = "bold 24px 'Courier New', monospace";
            context.textAlign = "center";
            context.shadowBlur = hohtoSyke;
            context.shadowColor = "#e9c46a"
            context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);
            context.restore();

            if (vilkkuu) {
                context.fillStyle = "#f4a261";
                context.font = "13px 'Courier New', monospace";
                context.textAlign = "center";
                context.fillText("Paina välilyöntiä!", canvas.width / 2, canvas.height / 2 + 25);
            }
            // Uusi ennätys tekstin ulkoasu
            if (paivitettyUusiEnnatys) {
                context.save();
                context.font = "bold 18px 'Courier New', monospace";
                context.fillStyle = "#70d6ff";
                context.shadowBlur = 15;
                context.shadowColor = "#70d6ff";
                context.textAlign = "center";
                context.fillText("🎆 UUSI ENNÄTYS! 🎆", canvas.width / 2, 80);
                context.restore();
            }
        }
        PiirraNeonKehys();
        requestAnimationFrame(gameLoop);
        return;
    }

    context.fillStyle = "#0d0221";
    context.fillRect(0, 0, canvas.width, canvas.height);
    piirraTahdet();

    if (oikeaPainettu && koriX + koriLeveys + koriNopeus <= canvas.width) {
        koriX += koriNopeus;
    } if (vasenPainettu && koriX - koriNopeus >= 0) {
        koriX -= koriNopeus;
    }
    //Palkin muutos Magenta-palkkiin
    context.save();
    context.shadowBlur = 10;
    context.shadowColor = "#e9c46a";
    context.fillStyle = "#e9c46a";
    context.fillRect(koriX, koriY, koriLeveys, 18);
    context.restore();

    //Hohtava pallo
    context.save();
    context.shadowBlur = 10;
    context.shadowColor = "#70d6ff";
    context.beginPath();
    context.arc(esineX, esineY, esineSade, 0, Math.PI * 2);
    context.fillStyle = "#239bdb";
    context.fill();
    context.restore();

    esineY += esineNopeus;

    if (esineY - esineSade > canvas.height) {
        esineY = 0;
        missit++;

        if (missit >= maksimiMissit) {
            pelikaynnissa = false;
            soitaHavioAani();

            if (taustaMusiikkiAjastin) {
                clearInterval(taustaMusiikkiAjastin);
                taustaMusiikkiAjastin = null;
            }
        }
        else {
            soitaOhiAani();
        }
        //Math.random() * (...) = satunnainen luku tältä väliltä
        //canvas.width - esineSade * 2 = käytettävissä oleva turvallinen leveys
        //+ esineSade = siirtää aloituskohdan oikealle, jotta ympyrä ei mene reunan yli
        esineX = Math.random() * (canvas.width - esineSade * 2) + esineSade;
    }

    if (esineY + esineSade >= koriY && esineX + esineSade >= koriX && esineX - esineSade <= koriX + koriLeveys) {
        pisteet++; //Lisää pisteen
        soitaOsumaAani();

        //Tason nopeutuminen
        taso = Math.floor(pisteet / 10);
        esineNopeus = 3 + taso * 0.8; //Pallon nopeus
        koriNopeus = 5 + taso * 1.2; //Laatan nopeus

        if (pisteet >= parastulos) {
            parastulos = pisteet;
            localStorage.setItem("parastulos", parastulos);
            paivitettyUusiEnnatys = true;

            if (!paivitettyUusiEnnatys) {
                paivitettyUusiEnnatys = true;
                uusiEnnatysEfektiKoko = 1.5;
                uusiEnnatysAjastin = 120;
            }
        }

        esineY = 0;
        esineX = Math.random() * (canvas.width - esineSade * 2) + esineSade;
    }


    //Piirtää pisteet ja missit. Context muistaa fonti ja tyylin, ei tarvitse toistaa
    context.font = "20px Arial";
    context.fillStyle = "#f4a261";
    context.textAlign = "left";

    context.fillText(`Pisteet: ${pisteet}`, 10, 20);
    context.fillText(`Elämät: ${missit} / ${maksimiMissit}`, 10, 40);
    context.fillText(`Ennätys: ${parastulos}`, 10, 60);



    context.textAlign = "right";
    context.fillStyle = "#f4a261";
    context.font = "14px 'Courier New', monospace"

    if (aanetPaalla) {
        context.fillText("Äänet: PÄÄLLÄ (M)", canvas.width - 10, 20);
    }
    else {
        context.fillText("Äänet: POIS (M)", canvas.width - 10, 20);
    }

    context.textAlign = "left";

    //Kehyksen piirto
    PiirraNeonKehys();

    requestAnimationFrame(gameLoop);

}

gameLoop()

// x kasvaa oikealle
// y kasvaa alaspäin