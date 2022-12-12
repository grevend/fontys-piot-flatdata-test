import Link from 'next/link'
import { PlantDataCommit } from '../types/plantdata'

export default function Plant({ commit, data: { roomTemp, timestamp} }: PlantDataCommit) {
  return (
    <article>
      <h2>{commit}</h2>
      <p>{JSON.stringify({roomTemp, timestamp})}</p>
      <Link href={`/status/${commit}`}>Read more...</Link>
    </article>
  )
}
