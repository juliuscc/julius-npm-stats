import npmUserPackages from 'npm-user-packages'
import got from 'got/dist/source'

type DownloadsDay = {
  day: string
  downloads: number
}

type PackageDownloads = {
  name: string
  downloads: DownloadsDay[]
  totalDownloads: number
  scoped: boolean
}

const API_URL_BASE = 'https://api.npmjs.org/downloads/range/last-year'

const packageIsScoped = (name: string) => name.startsWith('@')

const calculateTotal = (downloads: DownloadsDay[]): number =>
  downloads.reduce((acc, { downloads }) => acc + downloads, 0)

const sortPackages = (packageDownloads: PackageDownloads[]) =>
  packageDownloads.sort(({ totalDownloads: a }, { totalDownloads: b }) => b - a)

const getScopedPackage = async (name: string): Promise<PackageDownloads> => {
  const apiRresponse = (await got(`${API_URL_BASE}/${name}`).json()) as any

  return {
    name,
    downloads: apiRresponse.downloads,
    totalDownloads: calculateTotal(apiRresponse.downloads),
    scoped: true,
  }
}

const getUnscopedPackages = async (
  names: string[],
): Promise<PackageDownloads[]> => {
  const apiRresponse = (await got(
    `${API_URL_BASE}/${names.join(',')}`,
  ).json()) as any

  return Object.entries<any>(apiRresponse).map(([name, { downloads }]) => ({
    name,
    downloads,
    totalDownloads: calculateTotal(downloads),
    scoped: false,
  }))
}

export const getPackages = async (
  username: string,
): Promise<PackageDownloads[]> => {
  const packageMeta = await npmUserPackages(username)
  const packageNames = packageMeta.map(({ name }) => name)

  const scopedPackages = packageNames.filter(packageIsScoped)
  const unscopedPackages = packageNames.filter((name) => !packageIsScoped(name))

  const [scopedDownloads, unscopedDownloads] = await Promise.all([
    Promise.all(scopedPackages.map(getScopedPackage)),
    getUnscopedPackages(unscopedPackages),
  ])

  const packageDownloads = sortPackages([
    ...scopedDownloads,
    ...unscopedDownloads,
  ])

  return packageDownloads
}
