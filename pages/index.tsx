import { InferGetStaticPropsType } from 'next'
import styles from '../src/home/Home.module.css'
import { useEffect } from 'react'
import npmUserPackages from 'npm-user-packages'
import got from 'got'
import { getPackages } from '../src/utils/getPackages'

const packageIsScoped = (name: string) => name.startsWith('@')

type DownloadsDay = {
  day: string
  downloads: number
}

const calculateTotal = (downloads: DownloadsDay[]): number =>
  downloads.reduce((acc, { downloads }) => acc + downloads, 0)

const sortPackages = (
  packageDownloads: {
    name: string
    downloads: DownloadsDay[]
    totalDownloads: number
  }[],
) =>
  packageDownloads.sort(({ totalDownloads: a }, { totalDownloads: b }) => b - a)

export const getStaticProps = async (_context: unknown) => {
  const packageDownloads = await getPackages('jcelik')

  return {
    props: { packageDownloads },
    revalidate: 10,
  }
}

const Home = ({
  packageDownloads,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  // useEffect(() => console.log(packageDownloads))

  return (
    <div className={styles.container}>
      <h1>Julius NPM Stats</h1>
      <h2>Packages:</h2>
      {packageDownloads.map(({ name, downloads, totalDownloads }) => (
        <h3 key={name}>
          {name}: {totalDownloads}
        </h3>
      ))}
    </div>
  )
}

export default Home
