import Link from 'next/link'
import Head from 'next/head'
import React from 'react'
import { GetStaticProps, GetStaticPaths, NextPage } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { getAllDataSnapshots, getDataSnapshot } from "../../lib/plantdata_api"
import { PlantDataCommit } from "../../types/plantdata"

interface Params extends ParsedUrlQuery {
    id: string
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
    return {
        paths: getAllDataSnapshots(),
        fallback: false,
    }
}

export const getStaticProps: GetStaticProps<PlantDataCommit, Params> = async (
    context
) => {
    const { id } = context.params! as Params
    const snapshot = getDataSnapshot(id)
    return {
        props: {
            ...snapshot,
        },
    }
}

const PlantStatus: NextPage<PlantDataCommit> = (snapshot: PlantDataCommit) => {
    return (
        <main>
            <Head>
                <title>{snapshot.commit}</title>
            </Head>

            <h1>{snapshot.commit}</h1>
            <p>{JSON.stringify({ roomTemp: snapshot.data.roomTemp, timestamp: snapshot.data.timestamp })}</p>

            <picture>
                <source srcSet={`https://github.com/grevend/fontys-piot-flatdata-test/raw/${snapshot.commit}/plant-1.avif`} type="image/avif" />
                <source srcSet={`https://github.com/grevend/fontys-piot-flatdata-test/raw/${snapshot.commit}/plant-1.webp`} type="image/webp" />
                <img src={`https://github.com/grevend/fontys-piot-flatdata-test/raw/${snapshot.commit}/plant-1.png`} alt="Plant 1" />
            </picture>

            <picture>
                <source srcSet={`https://github.com/grevend/fontys-piot-flatdata-test/raw/${snapshot.commit}/plant-2.avif`} type="image/avif" />
                <source srcSet={`https://github.com/grevend/fontys-piot-flatdata-test/raw/${snapshot.commit}/plant-2.webp`} type="image/webp" />
                <img src={`https://github.com/grevend/fontys-piot-flatdata-test/raw/${snapshot.commit}/plant-2.png`} alt="Plant 2" />
            </picture>

            <Link href="/">Go back to dashboard overview</Link>
        </main>
    )
}

export default PlantStatus
