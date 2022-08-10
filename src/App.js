import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState, useRef } from "react";
import useTranslate from "./hooks/use-translate";

function App() {
  const divRef = useRef(null);
  const [val, setVal] = useState("");

  const {
    generateHTML: transform,
    innerHtml: html,
    text,
  } = useTranslate({
    heading: "heading",
    image: "image",
    paragraph: "paragraph",
    bold: "bold",
    italic: "italic",
    linebreak: "linebreak",
    boldItalic: "bold-italic",
    code: "code",
  });

  const onChangeHandler = e => {
    setVal(e.target.value);
    transform(e.target.value);
  };

  useEffect(() => {
    divRef.current.innerHTML = html;
  }, [html]);

  return (
    <div className="App">
      <div className="partition">
        <div className="left">
          <textarea onChange={onChangeHandler} value={val}></textarea>
          <div>{html}</div>
        </div>
        <div className="right">
          <div className="preview" ref={divRef}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
