"use strict";

const wssTools = (function() {
  function downloadABCFile(text) {
    // set the filename for downloading
    let filename = slugify(getABCheaderValue("T:", text)) + ".abc";

    downloadFile(filename, text);
  }

  function downloadFile(filename, text) {
    let pom = document.createElement("a");
    pom.setAttribute(
      "href",
      "data:application/download;charset=utf-8," +
      encodeURIComponent(text)
    );
    pom.setAttribute("download", filename);

    if (document.createEvent) {
      let event = document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  }

  // https://lucidar.me/en/web-dev/how-to-slugify-a-string-in-javascript/
  function slugify(str) {
    str = str.replace(/^\s+|\s+$/g, '');

    // Make the string lowercase
    str = str.toLowerCase();

    // Remove accents, swap ñ for n, etc
    var from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
    var to = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    // Remove invalid chars
    str = str.replace(/[^a-z0-9 -]/g, '')
      // Collapse whitespace and replace by -
      .replace(/\s+/g, '-')
      // Collapse dashes
      .replace(/-+/g, '-');

    return str;
  }

  function show_iframe(url) {
    // Add other sources as needed
    if (url.startsWith("https://www.youtube.com/")) {
      let myURL = url.replace("&t=", "?start=").split("v=")[1];

      return `<div class="container-iframe"><iframe class="responsive-iframe" aria-label="iframe showing youtube video" src="https://www.youtube.com/embed/${myURL}" frameborder="0" allowfullscreen></iframe></div>`;

    } else if (url.startsWith("https://www.facebook.com/")) {
      let myURL = encodeURI(url);

      return `<div class="container-iframe"><iframe class="responsive-iframe" aria-label="iframe showing facebook video" src="https://www.facebook.com/plugins/video.php?href=${myURL}&show_text=0&mute=0"  scrolling="no" frameborder="0" allowTransparency="true" allowFullScreen="false"></iframe></div>`;

    } else if (url.startsWith("https://vimeo.com/")) {
      let myURL = url.split("vimeo.com/")[1];

      return `<div class="container-iframe"><iframe class="responsive-iframe" aria-label="iframe showing vimeo video" src="https://player.vimeo.com/video/${myURL}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>`;

    } else if (url.startsWith("https://soundcloud.com/")) {
      let myURL = encodeURI(url);

      return `<div class="container-iframe"><iframe class="responsive-iframe" aria-label="iframe showing soundcloud video" src="https://w.soundcloud.com/player/?url=${myURL}&hide_related=true" width="100%"></iframe></div>`;

    } else if (url.startsWith("https://media.comhaltas.ie/video/")) {
      let myURL = encodeURI(url);

      return `<div class="container-iframe"><video class="responsive-iframe" aria-label="iframe showing comhaltas video" controls><source src="${myURL}" type="video/mp4"></video></div>`;

    } else if (url.endsWith(".mp3")) {
      let myURL = encodeURI(url);

      return `<div class="container-iframe-audio"><audio class="responsive-iframe"  aria-label="iframe playing mp3 file" controls><source src="${myURL}" type="audio/mp3" ></audio></div>`;

    } else {
      // Don't recognize this URL
      return "";
    }
  }

  function showMDform(myForm, textArea) {
    let elements = document.getElementById(myForm).elements;
    let mdFormObj = {};

    let dateTime = new Date();
    let year = dateTime.getFullYear();
    let month = dateTime.getMonth() + 1;
    let day = dateTime.getDate();
    // Pad these with leading '0' if needed
    month = month.toString().padStart(2, 0);
    day = day.toString().padStart(2, 0);
    let dateStamp = `${year}-${month}-${day}`;

    let titleSlug = '';
    mdFileName = '';

    // Display the output in the modal area
    modal.style.display = "block";

    document.getElementById(textArea).innerHTML = '---\n';

    for (let i = 0; i < elements.length; i++) {
      let item = elements.item(i);

      if (item.value == "Show MD File") {
        continue;
      }
      switch (item.name) {
        case 'title':
          if (item.value.includes("T:")) {
            alert(`Title includes 'T:' - ${item.value}`);
          }
          mdFormObj[item.name] = toTitleCase(item.value);
          // strip leading 'The' from title
          titleSlug = slugify(mdFormObj[item.name].replace(/^\bthe\b/i, ''));
          break;
        case 'titleID':
          if (titleSlug) {
            mdFormObj[item.name] = `${titleSlug}.md`;
            mdFileName = `${titleSlug}.md`;
          } else {
            alert('No Title defined');
            mdFormObj[item.name] = '';
          }
          break;
        case 'key':
          mdFormObj[item.name] = toTitleCase(item.value);
          break;
        case 'date':
          mdFormObj[item.name] = dateStamp;
          break;
        case 'mp3_file':
          if (item.checked) {
            if (titleSlug) {
              mdFormObj[item.name] = `/mp3/${titleSlug}.mp3`
            } else {
              alert('No MP3 file name defined');
              mdFormObj[item.name] = '';
            }
          } else {
            mdFormObj[item.name] = '';
          }
          break;
        case 'repeats':
          if (mdFormObj['mp3_file'] && parseInt(item.value)) {
            mdFormObj[item.name] = parseInt(item.value);
          } else {
            alert(`Check value for Repeats - '${item.value}'`);
          }
          break;
        case 'parts':
          if (mdFormObj['mp3_file'] && item.value.includes("AB")) {
            mdFormObj[item.name] = item.value;
          } else {
            alert(`Check value for Parts - '${item.value}'`);
          }
          break;
        case 'abc':
          // add the abc details adding the leading '|' and the right indentation
          mdFormObj[item.name] = '|\n';
          let lines = item.value.split('\n');
          for (let j = 0; j < lines.length; j++) {
            mdFormObj[item.name] += '    ' + lines[j].replace(/^\s*/, '') + '\n';
          }
          // check to see if the provided title matches the ABC details
          let abctitle = getABCheaderValue("T:", item.value);
          if (mdFormObj['title'] != abctitle) {
            alert('md title: ' + mdFormObj['title'] + ' != abc title: ' + abctitle);
          }
          // check to see if the provided rhythm matches the ABC details
          let abcrhythm = getABCheaderValue("R:", item.value);
          if (mdFormObj['rhythm'] != abcrhythm) {
            alert('md rhythm: ' + mdFormObj['rhythm'] + ' != abc rhythm: ' + abcrhythm);
          }
          // check to see if the provided key matches the ABC details
          let abckey = getABCheaderValue("K:", item.value);
          if (mdFormObj['key'] != abckey) {
            alert('md key: ' + mdFormObj['key'] + ' != abc key: ' + abckey);
          }
          break;
        default:
          mdFormObj[item.name] = item.value;
      }
      document.getElementById(textArea).innerHTML += item.name + ': ' + mdFormObj[item.name] + '\n';
    }

    document.getElementById(textArea).innerHTML += '---\n';
  }


  function showNFform(myForm, textArea) {
    let elements = document.getElementById(myForm).elements;
    let mdFormObj = {};

    let dateTime = new Date();
    let year = dateTime.getFullYear();
    let month = dateTime.getMonth() + 1;
    let day = dateTime.getDate();
    // Pad these with leading '0' if needed
    month = month.toString().padStart(2, 0);
    day = day.toString().padStart(2, 0);
    let dateStamp = `${year}-${month}-${day}`;

    let titleSlug = '';
    mdFileName = '';

    // Display the output in the modal area
    modal.style.display = "block";

    document.getElementById(textArea).innerHTML = '---\n';

    for (let i = 0; i < elements.length; i++) {
      let item = elements.item(i);

      if (item.value == "Show MD File") {
        continue;
      }
      switch (item.name) {
        case 'title':
          if (item.value.includes("T:")) {
            alert(`Title includes 'T:' - ${item.value}`);
          }
          mdFormObj[item.name] = toTitleCase(item.value);
          // strip leading 'The' from title
          titleSlug = slugify(mdFormObj[item.name].replace(/^\bthe\b/i, ''));
          break;
        case 'titleID':
          if (titleSlug) {
            mdFormObj[item.name] = `${titleSlug}.md`;
            mdFileName = `${titleSlug}.md`;
          } else {
            alert('No Title defined');
            mdFormObj[item.name] = '';
          }
          break;
        case 'key':
          mdFormObj[item.name] = toTitleCase(item.value);
          break;
        case 'date':
          mdFormObj[item.name] = dateStamp;
          break;
        case 'abc':
          // add the abc details adding the leading '|' and the right indentation
          mdFormObj[item.name] = '|\n';
          let lines = item.value.split('\n');
          for (let j = 0; j < lines.length; j++) {
            mdFormObj[item.name] += '    ' + lines[j].replace(/^\s*/, '') + '\n';
          }
          // check to see if the provided title matches the ABC details
          let abctitle = getABCheaderValue("T:", item.value);
          if (mdFormObj['title'] != abctitle) {
            alert('md title: ' + mdFormObj['title'] + ' != abc title: ' + abctitle);
          }
          // check to see if the provided rhythm matches the ABC details
          let abcrhythm = getABCheaderValue("R:", item.value);
          if (mdFormObj['rhythm'] != abcrhythm) {
            alert('md rhythm: ' + mdFormObj['rhythm'] + ' != abc rhythm: ' + abcrhythm);
          }
          // check to see if the provided key matches the ABC details
          let abckey = getABCheaderValue("K:", item.value);
          if (mdFormObj['key'] != abckey) {
            alert('md key: ' + mdFormObj['key'] + ' != abc key: ' + abckey);
          }
          break;
        default:
          mdFormObj[item.name] = item.value;
      }
      document.getElementById(textArea).innerHTML += item.name + ': ' + mdFormObj[item.name] + '\n';
    }

    document.getElementById(textArea).innerHTML += '---\n';
  }


  function getABCheaderValue(key, tuneABC) {
    // Extract the value of one of the ABC keywords e.g. T: Out on the Ocean
    const KEYWORD_PATTERN = new RegExp(`^\\s*${key}`);

    const lines = tuneABC.split(/[\r\n]+/).map(line => line.trim());
    const keyIdx = lines.findIndex(line => line.match(KEYWORD_PATTERN));
    if (keyIdx < 0) {
      return '';
    } else {
      return lines[keyIdx].split(":")[1].trim();
    }
  }

  function enterSearch(searchBox, submitSearch) {
    let enterSearch = document.getElementById(searchBox);
    enterSearch.addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById(submitSearch).click();
      }
    });
  }


  const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  function handleABCFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.target.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    for (var i = 0, f; f = files[i]; i++) {
      var reader = new FileReader();

      reader.onload = function(e) {
        // the ABC file should have "X:", "T:", "K:" fields to be valid
        if (this.result.match(/[XTK]:/g).length >= 3) {
          // Show the dots
          fileInfo.innerHTML = '';
          textAreaABC.value = this.result + "\n";
          audioPlayer.stopABCplayer();
          audioPlayer.displayABC(textAreaABC.value);
        } else {
          fileInfo.innerHTML = '<h2>Invalid ABC file - missing "X:", "T:", "K:" fields</h2>';
        }
      };

      reader.readAsText(f);
    }
  }

  return {
    downloadABCFile: downloadABCFile,
    downloadFile: downloadFile,
    slugify: slugify,
    show_iframe: show_iframe,
    enterSearch: enterSearch,
    getRandomInt: getRandomInt,
    showMDform: showMDform,
    showNFform: showNFform,
    handleABCFileSelect: handleABCFileSelect
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = wssTools;
}
