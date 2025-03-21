const synth = window.speechSynthesis;
let voice

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function populateVoiceList() {
    voice = synth.getVoices()
        .find(x => x.name == 'Microsoft Ava Online (Natural) - English (United States)');
}

export function speak(text: string) {
    if (synth.speaking) {
        console.error("speechSynthesis.speaking");
        synth.cancel();
    }

    if (text !== "") {
        text = text.replaceAll(/\s/g, ' ')
        text = text.replaceAll(/Caterpie/ig, 'Car-ter-pee')
        const utterThis = new SpeechSynthesisUtterance(text);

        utterThis.onend = function (event) {
            console.log("SpeechSynthesisUtterance.onend");
        };

        utterThis.onerror = function (event) {
            console.error("SpeechSynthesisUtterance.onerror");
        };

        utterThis.voice = voice;
        utterThis.pitch = 1;
        utterThis.rate = 1;
        synth.speak(utterThis);
    }
}