let headingRegex = /^\/img\s\[(.*?)]\s\((.*?)\)$/gm;

const regexMap = {
  codeBlock: /^\/co\n([\n\s\S]*?)\n\/ce$/gm,
  break: /^\n$/gm,
  heading: /^\/h3\s(.*?)$/gm,
  image: /^\/img\s\[(.*?)]\s\((.*?)\)$/gm,
  paragraph: /^(.+?)$/gm,
  linebreak: /^\/lb$/gm,
};
let st = `
/h3 How to Pimp Up the Git Bash Prompt on Windows (without any External Stuff)
/img [Splash] (https://miro.medium.com/max/788/0*0WZixeXAB7QzKLkr)
As a programmer, you are thought to constantly use Git, typing specific commands in a console (unless you prefer some UI-based approach). Since I work on Windows currently, I’ve been forced to use the Git Bash console. Though it does work, still I perceive it pretty boring and even tiring — especially when I must scroll up output to check something, I need to strain my eyes as prompt blends into other stuff.
/img [Splash] (https://miro.medium.com/max/788/1*-MY5ckPjbx5h6wxK8sdy1A.png)

For users who work on Linux, __ OhMyZsh __ is up for grabs. Yet, when it comes to Windows users, a different extension must be applied. Having had been searching for some simple plugin to quickly colorize prompt, I must admit it’s not a trivial task. I’ve known that it’s possible to change Bash prompt by PS1 variable, so I thought why not to set custom prompt just via this variable.


/img [Splash] (https://miro.medium.com/max/788/1*PLVMZiIvEw-FKN-9xKWxgw.png)

/lb

/h3 Displaying Basic Info in Prompt


In the picture above you see that I set >>>> as prompt. Of course, it could be any else character. But what if we would like to display specific info, like current directory or username? Special escape characters are provided:


/co
body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
/ce

Anvay

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
          if (!details[x[1]]) {
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

for (const x in regexMap) {
  const matchedRes = st.matchAll(regexMap[x]);
  for (const y of matchedRes) {
    if (x === "break") {
      console.log(y[0]);
    }
    if (!details[y[1]] || x === "break") {
      let convertedString = markdownParser(y, x, details);
      details[y[1]] = true;
      flag[y.index] = true;
      parsedHTML = parsedHTML.replace(y[0], convertedString);
    }
  }
}

console.log(flag);

console.log(details);

console.log(parsedHTML);
