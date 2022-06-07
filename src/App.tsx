import React, { useState } from "react";
import "./App.scss";

function App() {
  const [lengthStr, setLengthStr] = useState("5");
  const [words, setWords] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [invalid, setInvalid] = useState("");
  const [wrongPlace, setWrongPlace] = useState("");
  const [knownPlaces, setKnownPlaces] = useState<any>({});

  if (words.length === 0) {
    fetch("/kotus-sanalista_v1.txt")
      .then((res) => res.text())
      .then((data) =>
        setWords(data.toLowerCase().replace("\r", "").split("\n"))
      );
  }

  const updateResults = async (
    len: string,
    inv: string,
    wrp: string,
    known: any
  ) => {
    setLengthStr(len);
    setInvalid(inv);
    setWrongPlace(wrp);
    setKnownPlaces(known);

    let r: string[] = words;
    const length = parseInt(len);

    // Filter out words that are too short or too long
    r = r.filter((w: string) => w.length === length);

    // Filter out words that match invalid characters
    r = r.filter((w: string) => {
      let containsAll = true;
      const c = wrp.toLowerCase().split("");
      for (let i = 0; i < c.length; i++) {
        if (!w.includes(c[i])) {
          containsAll = false;
          break;
        }
      }
      return containsAll;
    });

    // Filter out words that don't match required characters
    r = r.filter((w: string) => {
      let containsAll = true;
      const c = inv.toLowerCase().split("");
      for (let i = 0; i < c.length; i++) {
        if (w.includes(c[i])) {
          containsAll = false;
          break;
        }
      }
      return containsAll;
    });

    // Filter out words by known places
    r = r.filter((w: string) => {
      let containsAll = true;

      for (const kw in known) {
        const expected = known[kw].toLowerCase();
        const expectedPlace = kw.split("c")[1];

        if (expectedPlace === "") {
          continue;
        }

        const place = parseInt(expectedPlace);
        if (w.charAt(place) !== expected) {
          containsAll = false;
          break;
        }
      }

      return containsAll;
    });

    // Remove duplicates
    r = r.filter((w: string, i: number) => r.indexOf(w) === i);

    setResults(r);
  };

  const knownPlacesInputs = () => {
    let inputs = [];
    for (let i = 0; i < parseInt(lengthStr); i++) {
      inputs.push(
        <input
          key={`known-input-${i}`}
          type="text"
          className="knownInput"
          placeholder={`${i + 1}`}
          value={knownPlaces[`c${i.toString()}`] || ""}
          onChange={(e) =>
            updateResults(lengthStr, invalid, wrongPlace, {
              ...knownPlaces,
              [`c${i}`]: e.target.value.toUpperCase(),
            })
          }
        />
      );
    }
    return inputs;
  };

  return (
    <div className="App">
      <div className="App-main">
        <h1>Sanuli Solver</h1>
        {words.length === 0 ? (
          <p>Ladataan...</p>
        ) : (
          <>
            <div className="input-group">
              <label htmlFor="length">Sanan pituus</label>
              <input
                type="number"
                name="length"
                value={lengthStr}
                onChange={(e) => {
                  updateResults(
                    e.target.value,
                    invalid,
                    wrongPlace,
                    knownPlaces
                  );
                }}
              ></input>
            </div>
            <div className="input-group">
              <label htmlFor="invalid">Virheelliset kirjaimet</label>
              <input
                type="text"
                name="invalid"
                value={invalid}
                onChange={(e) => {
                  updateResults(
                    lengthStr,
                    e.target.value.toUpperCase(),
                    wrongPlace,
                    knownPlaces
                  );
                }}
              ></input>
            </div>
            <div className="input-group">
              <label htmlFor="wrongPlace">Sisältää kirjaimet</label>
              <input
                type="text"
                name="wrongPlace"
                value={wrongPlace}
                onChange={(e) => {
                  updateResults(
                    lengthStr,
                    invalid,
                    e.target.value.toUpperCase(),
                    knownPlaces
                  );
                }}
              ></input>
            </div>
            <div className="input-group">
              <label>Tiedetyt kirjaimet</label>
              <div className="knownPlaces">{knownPlacesInputs()}</div>
            </div>
            <div className="results">
              <h2>Tulokset ({results.length})</h2>
              <ul>
                {results.slice(0, 50).map((word: string) => {
                  return <li key={`result-${word}`}>{word.toUpperCase()}</li>;
                })}
                {results.length > 50 && (
                  <li>
                    <i>Näytetään vain 50 tulosta.</i>
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
