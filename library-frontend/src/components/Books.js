import { useQuery } from "@apollo/client"
import { useState } from "react"
import { ALL_BOOKS } from "../queries"

const Books = (props) => {
  const [genre, setGenre] = useState('')

  const result = useQuery(ALL_BOOKS,{
    variables:{genre}
  })
  
  if (!props.show) {
    return null
  }

  if(result.loading) {
    return <div>loading...</div>
  }

  const filterGenre = (event) => {
    setGenre(event.target.value)
  }

  const books = result.data.allBooks

  return (
    <div>
      <h2>books</h2>
      <p>in genre <strong>{genre === '' ? 'all genres': genre}</strong></p>
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
      <button onClick={filterGenre} value="refactoring">refactoring</button>
      <button onClick={filterGenre} value="agile">agile</button>
      <button onClick={filterGenre} value="design">design</button>
      <button onClick={filterGenre} value="patterns">patterns</button>
      <button onClick={filterGenre} value="crime">crime</button>
      <button onClick={filterGenre} value="classic">classic</button>
      <button onClick={filterGenre} value="">all genres</button>
    </div>
  )
}

export default Books
