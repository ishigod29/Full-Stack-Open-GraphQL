import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { ALL_BOOKS, ME } from "../queries";

const Recommend = (props) => {
  const [favoriteGenre, setFavoriteGenre] = useState("");
  const myAccount = useQuery(ME);


  const result = useQuery(ALL_BOOKS, {
    variables: {genre: favoriteGenre },
  });

  useEffect(() => {
    const getUser = async  () => {
        try {
            if (myAccount.data) {
            const genre = await myAccount.data.me.favoriteGenre
            setFavoriteGenre(genre)
          }
        } catch (error) {
            props.setError(error.message)
        }
    }
    getUser()
  }, [myAccount.data]); // eslint-disable-line

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const books = result.data.allBooks;

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre <strong>{favoriteGenre ? favoriteGenre : ''}</strong></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;
