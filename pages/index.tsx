import { InferGetStaticPropsType } from 'next'
import styles from '../src/home/Home.module.css'
import { useEffect } from 'react'
import npmUserPackages from 'npm-user-packages'
import got from 'got'

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
  const packageMeta = await npmUserPackages('jcelik')
  const packageNames = packageMeta.map(({ name }) => name)

  const scopedPackages = packageNames.filter(packageIsScoped)
  const unscopedPackages = packageNames.filter((name) => !packageIsScoped(name))

  const apiUrlBase = 'https://api.npmjs.org/downloads/range/last-year'

  const scopedDownloads: {
    name: string
    downloads: DownloadsDay[]
  }[] = await Promise.all(
    scopedPackages.map(async (name) => ({
      name,
      downloads: ((await got(`${apiUrlBase}/${name}`).json()) as any).downloads,
    })),
  )

  const unscopedApiUrl = `${apiUrlBase}/${unscopedPackages.join(',')}`
  const unscopedDownloads: {
    name: string
    downloads: DownloadsDay[]
  }[] = Object.entries(
    await got(unscopedApiUrl).json(),
  ).map(([name, { downloads }]: [string, any]) => ({ name, downloads }))

  const packageDownloads = sortPackages(
    [...scopedDownloads, ...unscopedDownloads].map((packageInfo) => ({
      ...packageInfo,
      totalDownloads: calculateTotal(packageInfo.downloads),
    })),
  )

  return {
    props: { packageDownloads },
  }
}

const Home = ({
  packageDownloads,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  console.log(packageDownloads)

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
