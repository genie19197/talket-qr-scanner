import React, { useState, useEffect } from "react";
import QrScanner from "qr-scanner";

let isUsed = {
  genie: 0
};
const incrementUsage = (name) => {
  let count = 0;
  if (name in isUsed) {
    count = isUsed[name];
  }
  count = count + 1;
  isUsed[name] = count;
};
const getUsageCount = (name) => {
  let count = 0;
  if (name in isUsed) {
    count = isUsed[name];
  }
  return count;
};

const isSpeechPossible = () => {
  if ("speechSynthesis" in window) {
    console.log("Web Speech API supported!");
    return true;
  }

  console.log("Web Speech API not supported :-(");
  return false;
};

const readText = (ourText) => {
  if (!isSpeechPossible()) {
    return;
  }
  const utterThis = new SpeechSynthesisUtterance();
  const synth = window.speechSynthesis;
  utterThis.text = ourText;
  utterThis.rate = 0.9;
  console.log(synth.getVoices().length);
  synth.speak(utterThis);
};

let qrScanner = null;
let currentCameraIndex = 0;
export default function Scanner() {
  const [data, setData] = useState("고객");
  const [usage, setUsage] = useState("0");
  const [scannerSwitch, setScannerSwitch] = useState(0);
  const [cameras, setCameras] = useState([]);
  useEffect(() => {
    const setc = async () => {
      const list = await QrScanner.listCameras(true);
      setCameras(list);
      console.log(list);
    };
    setc();
    const videoElem = document.getElementById("qrvideo");

    var device_height = 500;
    var device_width = 500;
    if (window.screen.height < window.screen.width) {
      device_height = window.screen.height / 2;
    } else {
      device_height = window.screen.width / 2;
    }
    device_width = device_height;

    // set height and width of video
    videoElem.style.width = "120vh";
    videoElem.style.height = "100vh";
    if (qrScanner === null) {
      var _qrScanner = new QrScanner(
        videoElem,
        (result) => {
          console.log("decoded qr code:", result);
          _qrScanner.stop();
          const nftname = result.data;

          incrementUsage(nftname);
          setUsage(getUsageCount(nftname));
          const readMessage = `${nftname}님 안녕하세요.`;
          readText(readMessage);
          setData(nftname);
          setTimeout(() => {
            _qrScanner.start();
          }, 2000);
        },
        {
          onDecodeError: (e) => {
            console.log("not decoded");
          },
          maxScansPerSecond: 1,
          highlightScanRegion: true
          // highlightCodeOutline: true

          /* your options or returnDetailedScanResult: true if you're not specifying any other options */
        }
      );
      qrScanner = _qrScanner;
      _qrScanner.start();
    }
  }, [scannerSwitch]);
  return (
    <div
      onClick={async () => {
        if (cameras.length > 0) {
          let _nextIndex = currentCameraIndex + 1;
          if (_nextIndex === cameras.length) {
            _nextIndex = 0;
          }
          currentCameraIndex = _nextIndex;
          await qrScanner.setCamera(cameras[_nextIndex].id);
        }
      }}
    >
      <div id="qrvideo-container" class="center-container">
        <video id="qrvideo"></video>
      </div>
    </div>
  );
}
