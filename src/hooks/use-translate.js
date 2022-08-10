import { useState, useCallback } from "react";

const regexMap = {
  codeBlock: /^```([\n\s\S]*?)```$/gm,
  paragraph: /^(.+?)$/gm,
  break: /\n/gm,
  italic: /(?<=_{1})\w+[^._!?]+[.!?a-zA-Z0-9()]+(?=_{1})/gm,
  bold: /(?<=\*{1})\w+[^.*!?]+[.!?a-zA-Z0-9()]+(?=\*{1})/gm,
  boldItalic: /(?<=\*_)\w+[^._!?]+[.!?a-zA-Z0-9()]+(?=_\*)/gm,
  italicBold: /(?<=_\*)\w+[^._!?]+[.!?a-zA-Z0-9()]+(?=\*_)/gm,
  heading: /^\/h3\s(.*?)$/gm,
  image: /^\/img\s\[(.*?)]\s\((.*?)\)$/gm,
  linebreak: /^\/lb$/gm,
  link: /(?<=\/link\s)[\[](.*?)[\]]\s[\(](.*?)[\)]/gm,
  code: /(?<=`)[^.*_!?]+[\s.!?a-zA-Z0-9<>]+(?=`)/gm,
};

const useTranslate = classesObject => {
  const [innerHtml, setInnerHtml] = useState("");
  const [text, setText] = useState({
    title: [],
    paragraph: [],
  });

  const flagMapper = useCallback((rawText, regexMap) => {
    const flags = {};

    const lines = rawText.matchAll(/^(.+?)$/gm);
    const breaks = rawText.matchAll(/\n\n/gm);

    for (const x of rawText.matchAll(regexMap["link"])) {
      console.log(x);
      flags[x.index] = ["link", x];
    }

    for (const x of rawText.matchAll(regexMap["code"])) {
      console.log(x);
      const obj = x;
      obj[0] = obj[0]
        .replaceAll("\n", "<br>")
        .replaceAll(">", "&gt;")
        .replaceAll("<", "&lt;")
        .replaceAll("*", "&#65121;");
      console.log(obj);
      flags[x.index] = ["code", x];
    }

    for (const x of rawText.matchAll(regexMap["italic"])) {
      flags[x.index] = ["italic", x];
    }

    for (const x of rawText.matchAll(regexMap["bold"])) {
      flags[x.index] = ["bold", x];
    }

    for (const x of rawText.matchAll(regexMap["boldItalic"])) {
      flags[x.index] = ["boldItalic", x];
    }

    for (const x of rawText.matchAll(regexMap["italicBold"])) {
      flags[x.index] = ["italicBold", x];
    }

    for (const x of lines) {
      flags[x.index] = ["paragraph", x];
    }

    for (const x of breaks) {
      flags[x.index] = ["break", x];
    }

    for (const x in regexMap) {
      if (
        x === "break" ||
        x === "paragraph" ||
        x === "italic" ||
        x === "bold" ||
        x === "boldItalic" ||
        x === "italicBold" ||
        x === "link" ||
        x === "code"
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
  }, []);

  const createRangeForPTags = useCallback((flags, flagIndexes, index) => {
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
  }, []);

  const generateHTML = useCallback(
    rawText => {
      const flags = flagMapper(rawText, regexMap);
      const flagIndexes = Object.keys(flags);
      console.log(flags);
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
                case "code": {
                  currString = currString.replace(
                    `\`${val}\``,
                    `<span class=code-sign>${val
                      .replaceAll("\n", "<br>")
                      .replaceAll(">", "&gt;")
                      .replaceAll("<", "&lt;")}</span>`
                  );
                  break;
                }
                case "link": {
                  currString = currString.replace(
                    `/link ${val}`,
                    `<a href=${flags[flagIndexes[j]][1][2]}>${
                      flags[flagIndexes[j]][1][1]
                    }</a>`
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
      setInnerHtml(str);
    },
    [createRangeForPTags, flagMapper]
  );
  return { generateHTML, innerHtml, text };
};

export default useTranslate;
