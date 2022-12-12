import Head from 'next/head'
import { GetStaticProps, NextPage } from 'next'
import Plant from '../components/plant'
import { PlantDataCommit, PlantDataSnapshots } from "../types/plantdata"
import { getAllDataSnapshots } from "../lib/plantdata_api"

export const getStaticProps: GetStaticProps = async (_context) => {
  console.log(getAllDataSnapshots())
  return {
    props: {
      snapshots: [],
    },
  }
}

const IndexPage: NextPage<PlantDataSnapshots> = ({ snapshots }: PlantDataSnapshots) => {
  return (
    <main>
      <Head>
        <title>Plant Dashboard</title>
      </Head>

      <h1>List of plants</h1>

      <section>
        {snapshots.map((data: PlantDataCommit) => (
          <Plant {...data} key={data.commit} />
        ))}
      </section>
    </main>
  )
}

export default IndexPage
