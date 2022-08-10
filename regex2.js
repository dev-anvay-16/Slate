let headingRegex = /^\/img\s\[(.*?)]\s\((.*?)\)$/gm;

const regexMap = {
  codeBlock: /^\/co([\n\s\S]*?)\/ce$/gm,
  paragraph: /^(.+?)$/gm,
  break: /\n/gm,
  italic: /^_(.+?)_$/gm,
  bold: /^\*(.+?)\*$/gm,
  boldItalic: /^\*_(.+?)_\*$/gm,
  italicBold: /^_\*(.+?)\*_$/gm,
  heading: /^\/h3\s(.*?)$/gm,
  image: /^\/img\s\[(.*?)]\s\((.*?)\)$/gm,
  linebreak: /^\/lb$/gm,
  link: /^\/link\s\[(.*?)]\s\((.*?)\)$/gm,
};
let st = `
/h3 Heading2
Anvay
/img [description3] (https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/sunset-quotes-21-1586531574.jpg)
/lb
/h3 basic info
/co
    print("HELLO WORLD")
    console.log("HELLO WORLD")
/ce
Anvay
/co
    body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
/ce
Anvay Wankhede
`;

let parsedHTML = st;
const flag = {};
const details = {};

const markdownParser = (st, key, flag) => {
  let str = st[0];

  if (!flag[st.index]) {
    switch (key) {
      case "codeBlock": {
        str = st[1];
        str = str.replaceAll(">", "&gt;");
        str = str.replaceAll("<", "&lt;");
        str = str.replaceAll("/", "&#47;");
        const matchCodeRes = str.matchAll(/^(.+)$/gm);
        for (const x of matchCodeRes) {
          console.log(x[1]);
          if (!flag) {
            flag[st.index + x.index] = true;
            details[x[1]] = true;
          }
        }
        str = `<pre class=code><code>${str}</code></pre>`;
        console.log(str);
        break;
      }
      case "linebreak": {
        str = `<div class=linebreak></div>`;
        break;
      }
      case "break": {
        console.log("BREAK");
        str = `<br>`;
        break;
      }
      case "paragraph": {
        str = `<p class=paragraph>${st[1]}</p>`;
        break;
      }
      case "heading": {
        str = `<h3 class=heading>${st[1]}</h3>`;
        break;
      }
      case "image": {
        str = `<img class=image alt =${st[1]} src=${st[2]} />`;
        break;
      }
      default:
        break;
    }
  }
  return str;
};

const fillFlagIndex = (str, flag) => {
  const lines = str.matchAll(/^(.+?)$/gm);
  const breaks = str.matchAll(/\n\n/gm);

  for (const x of lines) {
    flag[x.index] = ["lines", x];
    console.log(x[0]);
  }

  for (const x of breaks) {
    console.log(x);
    flag[x.index] = ["breaks", x];
  }

  console.log(flag);

  const codeBlock = str.matchAll(/^\/co([\n\s\S]*?)\/ce$/gm);

  for (const x of codeBlock) {
    const length = x[0].length;

    flag[x.index] = ["codeBlock", x];

    console.log(x.index + " + " + length + " = " + (+x.index + +length));
    for (const i in flag) {
      if (i > x.index && i < x.index + length - 1) {
        flag[i] = "codeBlock";
      }
    }
  }

  const images = str.matchAll(/^\/img\s\[(.*?)]\s\((.*?)\)$/gm);

  for (const x of images) {
    console.log(x);
    const length = x[0].length;
    flag[x.index] = ["image", x];

    console.log(x.index + " + " + length + " = " + (+x.index + +length));
    for (const i in flag) {
      if (i > x.index && i < x.index + length - 1) {
        flag[i] = "image";
      }
    }
  }

  const headings = str.matchAll(/^\/h3\s(.*?)$/gm);

  for (const x of headings) {
    console.log(x);
    const length = x[0].length;
    flag[x.index] = "heading";

    for (const i in flag) {
      if (i > x.index && i < x.index + length - 1) {
        flag[i] = "heading";
      }
    }
  }

  const lbs = str.matchAll(/^\/lb$/gm);

  for (const x of lbs) {
    console.log(x);
    const length = x[0].length;
    flag[x.index] = ["linebreak", x];

    console.log(x.index + " + " + length + " = " + (+x.index + +length));
    for (const i in flag) {
      if (i > x.index && i < x.index + length - 1) {
        flag[i] = "linebreak";
      }
    }
  }
};

// for (const x in regexMap) {
//     const matchedRes = st.matchAll(regexMap[x]);
//     for (const y of matchedRes) {

//         if(!flag[y.index]){
//            let convertedString =  markdownParser(y, x, details)
//              flag[y.index] = true;
//                 parsedHTML = parsedHTML.replace(y[0],convertedString)
//         }

//     }
// }

// fillFlagIndex(st, flag);

// console.log(flag);

// console.log(details);

// console.log(parsedHTML);

let st2 = `
\`Anvay\`
`;

const flagMapper = (rawText, regexMap) => {
  const flags = {};

  const lines = rawText.matchAll(/^(.+?)$/gm);
  const breaks = rawText.matchAll(/\n\n/gm);

  for (const x of rawText.matchAll(
    /(?<=_{1})\w+[^._!?]+[.!?a-zA-Z0-9()]+(?=_{1})/gm
  )) {
    flags[x.index] = ["italic", x];
  }

  for (const x of rawText.matchAll(
    /(?<=\*{1})\w+[^.*!?]+[.!?a-zA-Z0-9()]+(?=\*{1})/gm
  )) {
    flags[x.index] = ["bold", x];
  }

  for (const x of rawText.matchAll(
    /(?<=\*_)\w+[^._!?]+[.!?a-zA-Z0-9()]+(?=_\*)/gm
  )) {
    flags[x.index] = ["boldItalic", x];
  }

  for (const x of rawText.matchAll(
    /(?<=_\*)\w+[^._!?]+[.!?a-zA-Z0-9()]+(?=\*_)/gm
  )) {
    flags[x.index] = ["italicBold", x];
  }

  for (const x of lines) {
    flags[x.index] = ["paragraph", x];
  }

  for (const x of breaks) {
    flags[x.index] = ["break", x];
  }

  for (const x of rawText.matchAll(regexMap["link"])) {
    flags[x.index] = ["link", x];
  }

  for (const x in regexMap) {
    if (
      x === "break" ||
      x === "paragraph" ||
      x === "italic" ||
      x === "bold" ||
      x === "boldItalic" ||
      x === "italicBold"
    ) {
      continue;
    }
    const matchedRes = rawText.matchAll(regexMap[x]);
    for (const y of matchedRes) {
      const firstIndex = y.index;
      const lastIndex = y.index + y[0].length - 1;
      flags[firstIndex] = [x, y];
      for (const i in flags) {
        if (i > firstIndex && i < lastIndex) {
          flags[i] = [null, y];
        }
      }
    }
  }
  return flags;
};

const res = flagMapper(st2, regexMap);
const flagIndexes = Object.keys(res);
console.log(res);
console.log(flagIndexes);

// const html = res => {
//   let str = "";
//   for (const x in res) {
//     switch (res[x][0]) {
//       case "codeBlock": {
//         const translatedCodeTag = res[x][1][1]
//           .replaceAll(">", "&gt;")
//           .replaceAll("<", "&lt;")
//           .replaceAll("/", "&#47;");

//         str += `<pre class=code><code>${translatedCodeTag}</code></pre>`;
//         break;
//       }
//       case "linebreak": {
//         str += `<div class=linebreak></div>`;
//         break;
//       }
//       case "break": {
//         str += `<br>`;
//         break;
//       }
//       case "paragraph": {
//         str += `<p class=paragraph>${res[x][1][1]}</p>`;
//         break;
//       }
//       case "heading": {
//         str += `<h3 class=heading>${res[x][1][1]}</h3>`;
//         break;
//       }
//       case "image": {
//         str += `<img class=image alt =${res[x][1][1]} src=${res[x][1][2]} />`;
//         break;
//       }
//       default:
//         break;
//     }
//   }
//   return str;
// };

// console.log(html(res));

// const html2 = (flags, flagIndexes) => {
//   let str = "";
//   const valMap = {};
//   for (let i = 0; i < +flagIndexes.length; i++) {
//     switch (flags[flagIndexes[i]][0]) {
//       // case "codeBlock": {
//       //   const translatedCodeTag = res[x][1][1]
//       //     .replaceAll(">", "&gt;")
//       //     .replaceAll("<", "&lt;")
//       //     .replaceAll("/", "&#47;");
//       //   str += `<pre class=code><code>${translatedCodeTag}</code></pre>`;
//       //   break;
//       // }
//       // case "linebreak": {
//       //   str += `<div class=linebreak></div>`;
//       //   break;
//       // }
//       case "break": {
//         str += `<br>`;
//         break;
//       }
//       case "paragraph": {
//         valMap[flagIndexes[i]] = `<p class=paragraph>${
//           flags[flagIndexes[i]][1][1]
//         }</p>`;
//         let res = flags[flagIndexes[i]][1][0];
//         let tempIndex = i;
//         while (flags[flagIndexes[tempIndex]][0] !== "paragraph") {
//           ++tempIndex;
//           res = res.replace(flags[flagIndexes[tempIndex]])
//         }

//         break;
//       }
//       case "italic": {
//         let tempIndex = i;
//         while (flags[flagIndexes[tempIndex]][0] !== "paragraph") {
//           tempIndex--;
//         }
//         console.log(
//           "PREV",
//           flags[flagIndexes[tempIndex]][0],
//           flagIndexes[tempIndex],
//           flagIndexes[i]
//         );
//         let localCopy = flags[flagIndexes[tempIndex]][1][1];
//         const localCopyLength = flags[flagIndexes[tempIndex]][1][1].length;
//         console.log("LOCAL COPY LENGTH - ", localCopyLength);
//         let prevParaVal = valMap[flagIndexes[tempIndex]];

//         prevParaVal = prevParaVal.replace(
//           `_${flags[flagIndexes[i]][1][0]}_`,
//           `<em>${flags[flagIndexes[i]][1][0]}</em>`
//         );
//         // localCopy = `<p class=paragraph>${localCopy.slice(
//         //   0,
//         //   +flagIndexes[i] - +flagIndexes[tempIndex] - 1
//         // )}<em>${flags[flagIndexes[i]][1][0]}</em>${localCopy.slice(
//         //   +flagIndexes[i] -
//         //     +flagIndexes[tempIndex] +
//         //     flags[flagIndexes[i]][1][0].length +
//         //     1,
//         //   localCopy.length
//         // )}</p>`;
//         // console.log(localCopy);
//         // valMap[flagIndexes[i]] = localCopy;
//         valMap[flagIndexes[tempIndex]] = prevParaVal;
//         break;
//       }
//       case "bold": {
//         let tempIndex = i;
//         while (flags[flagIndexes[tempIndex]][0] !== "paragraph") {
//           tempIndex--;
//         }
//         console.log(
//           "PREV-BOLD",
//           flags[flagIndexes[tempIndex]][0],
//           flagIndexes[tempIndex],
//           flagIndexes[i]
//         );

//         let localCopy = flags[flagIndexes[tempIndex]][1][1];
//         let prevParaVal = valMap[flagIndexes[tempIndex]];

//         console.log(prevParaVal);

//         prevParaVal = prevParaVal.replace(
//           `*${flags[flagIndexes[i]][1][0]}*`,
//           `<strong>${flags[flagIndexes[i]][1][0]}</strong>`
//         );
//         console.log(prevParaVal);

//         // let localCopy = flags[flagIndexes[tempIndex]][1][1];
//         // localCopy = `<p class=paragraph>${localCopy.slice(
//         //   0,
//         //   +flagIndexes[i] - +flagIndexes[tempIndex] - 1
//         // )}<strong>${flags[flagIndexes[i]][1][0]}</strong>${localCopy.slice(
//         //   +flagIndexes[i] -
//         //     +flagIndexes[tempIndex] +
//         //     flags[flagIndexes[i]][1][0].length +
//         //     1,
//         //   localCopy.length
//         // )}</p>`;
//         // console.log(localCopy);
//         // valMap[flagIndexes[i]] = localCopy;
//         valMap[flagIndexes[tempIndex]] = prevParaVal;
//         break;
//       }

//       // case "heading": {
//       //   str += `<h3 class=heading>${res[x][1][1]}</h3>`;
//       //   break;
//       // }
//       // case "image": {
//       //   str += `<img class=image alt =${res[x][1][1]} src=${res[x][1][2]} />`;
//       //   break;
//       // }
//       default:
//         break;
//     }
//   }
//   return valMap;
// };

// console.log(html2(res, flagIndexes));
const createRangeForPTags = (flags, flagIndexes, index) => {
  let i = index;

  let currElement = flags[flagIndexes[i]];

  let tempMinIndex = currElement[1]["index"];
  let tempMaxIndex = currElement[1]["index"] + +currElement[1][0].length - 1;

  while (flags[flagIndexes[i]][1].index < tempMaxIndex) {
    if (i === flagIndexes.length - 1) {
      break;
    }
    i++;
    if (flags[flagIndexes[i]][1].index > tempMaxIndex) {
      i--;
      break;
    }
    if (
      flags[flagIndexes[i]][1][0].length - 1 + +flagIndexes[i] >
      tempMaxIndex
    ) {
      tempMaxIndex = flags[flagIndexes[i]][1][0].length + +flagIndexes[i] - 1;
    }
  }
  return [i, tempMinIndex, tempMaxIndex];
};

const html3 = (flags, flagIndexes) => {
  let str = "";
  const markdownStr = flags[flagIndexes[0]][1].input;
  for (let i = 0; i < +flagIndexes.length; i++) {
    switch (flags[flagIndexes[i]][0]) {
      case "codeBlock": {
        const translatedCodeTag = flags[flagIndexes[i]][1][1]
          .replaceAll(">", "&gt;")
          .replaceAll("<", "&lt;")
          .replaceAll("/", "&#47;");
        str += `<pre class=code><code>${translatedCodeTag}</code></pre>`;
        break;
      }
      case "linebreak": {
        str += `<div class=linebreak></div>`;
        break;
      }
      case "break": {
        str += `<br>`;
        break;
      }
      case "paragraph": {
        const [index, minTextIndex, maxTextIndex] = createRangeForPTags(
          flags,
          flagIndexes,
          i
        );
        console.log(minTextIndex, maxTextIndex);
        let currString = markdownStr.slice(minTextIndex, maxTextIndex + 1);
        for (let j = i; j <= index; j++) {
          const val = flags[flagIndexes[j]][1][0];

          switch (flags[flagIndexes[j]][0]) {
            case "italic": {
              currString = currString.replace(
                `_${val}_`,
                `<em>${val.replaceAll("\n", "<br>")}</em>`
              );
              break;
            }
            case "bold": {
              currString = currString.replace(
                `*${val}*`,
                `<strong>${val.replaceAll("\n", "<br>")}</strong>`
              );
              break;
            }
            case "boldItalic": {
              currString = currString.replace(
                `*_${val}_*`,
                `<strong><em>${val.replaceAll("\n", "<br>")}</em></strong>`
              );
              break;
            }
            case "italicBold": {
              currString = currString.replace(
                `_*${val}*_`,
                `<em><strong>${val.replaceAll("\n", "<br>")}</strong></em>`
              );
              break;
            }
            default: {
              break;
            }
          }
        }
        i = index;

        str += `<p class=paragraph>${currString}</p>`;
        break;
      }
      case "heading": {
        str += `<h3 class=heading>${flags[flagIndexes[i]][1][1]}</h3>`;
        break;
      }
      case "image": {
        str += `<img class=image alt =${flags[flagIndexes[i]][1][1]} src=${
          flags[flagIndexes[i]][1][2]
        } />`;
        break;
      }
      default:
        break;
    }
  }
  return str;
};

console.log(html3(res, flagIndexes));

// console.log(res[1][1].input);

// console.log(createRangeForPTags(res, flagIndexes, 6));

// for (const x in res) {
//   let currElement = res[x];

//   let tempMinIndex = +currElement[1].index;
//   let tempMaxIndex = +currElement[1].index + +currElement[1][0].length - 1;
//   console.log(tempMinIndex, res[x][0], tempMaxIndex);
// }

// createRangeForPTags(res, flagIndexes);

const std = res["1"][1].input;
console.log(std.slice(1, 72));

const linkRegex = /(?<=\/link\s)[\[](.*?)[\]]\s[\(](.*?)[\)]/gm;

const stw = "Anvay /link [desx desx] (url) Wankhede";

console.log([...stw.matchAll(linkRegex)]);

const paraChildrens = [
  "italic",
  "bold",
  "boldItalic",
  "italicBold",
  "link",
  "code",
  "paragraph",
  "twoNewlines",
];

const regexMapv2 = {
  codeBlock: /^```([\n\s\S]*?)```$/gm,
  paragraph: /^(.+?)$/gm,
  newline: /\n/gm,
  twoNewlines: /\n\n/gm,
  italic: /(?<=_{1})\w+[^._!?]+[.!?a-zA-Z0-9()]+(?=_{1})/gm,
  bold: /(?<=\*{1})\w+[^.*!?]+[.!?a-zA-Z0-9()]+(?=\*{1})/gm,
  boldItalic: /(?<=\*_)\w+[^._!?]+[.!?a-zA-Z0-9()]+(?=_\*)/gm,
  italicBold: /(?<=_\*)\w+[^._!?]+[.!?a-zA-Z0-9()]+(?=\*_)/gm,
  heading: /^\/h3\s(.*?)$/gm,
  image: /^\/img\s\[(.*?)]\s\((.*?)\)$/gm,
  linebreak: /^\/lb$/gm,
  link: /(?<=\/link\s)[[](.*?)[\]]\s[(](.*?)[)]/gm,
  code: /(?<=`)\w+[^._!?]+[.!?a-zA-Z0-9()]+(?=`)/gm,
};

const regexKeys = Object.keys(regexMapv2);
console.log(regexKeys);

regexKeys.forEach(ele => {
  const isTagsMatching = paraChildrens.reduce(
    (previousValue, currentValue) => ele === currentValue || previousValue,
    false
  );
  if (!isTagsMatching) {
    console.log(ele);
  }
});
