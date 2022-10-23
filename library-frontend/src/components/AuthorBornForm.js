import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const AuthorBornForm = ({ authors }) => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = (event) => {
    event.preventDefault();

    if (name.length !== 0) {
      editAuthor({ variables: { name, setBornTo: born } });
      setName("");
      setBorn("");
    }
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          <div>
            <select
              required
              value={name}
              onChange={({ target }) => setName(target.value)}
            >
              <option value="">select author</option>
              {authors.map((a) => {
                return (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                );
              })}
            </select>
          </div>
          <input
            type="number"
            value={born ? born : ""}
            onChange={({ target }) => setBorn(parseInt(target.value))}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default AuthorBornForm;
