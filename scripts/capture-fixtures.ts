import { mkdir, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const BASE_URL = 'https://be.itemsolution.com'
const OUTPUT_DIR = 'fixtures/raw'
const MAX_REDIRECTS = 5

const PAGES = {
  home: '/',
  'my-account': '/directories/myaccount',
  'financials-index': '/financials/index',
  'fonds-roulement': '/financials/view_fonds_roulement',
  'fonds-reserve': '/financials/view_fonds_reserve',
  'documents-list': '/docs',
  'documents-list-page-2': '/docs/index/page:2',
  'documents-folders': '/docs/ilist',
  'assemblies-index': '/assemblies/',
  'tickets-index': '/tickets/index',
  'tickets-add': '/tickets/add',
}

const setEcho = (enabled: boolean) => spawnSync('stty', [enabled ? 'echo' : '-echo'], { stdio: 'inherit' })

const readSecret = (label: string) => {
  setEcho(false)
  const value = prompt(label) ?? ''
  setEcho(true)
  console.info('')
  return value
}

const jar = new Map<string, string>()

const collectCookies = (response: Response) => {
  response.headers.getSetCookie().forEach((setCookie) => {
    const [pair] = setCookie.split(';')
    const separatorIndex = pair.indexOf('=')
    const name = pair.slice(0, separatorIndex)
    const value = pair.slice(separatorIndex + 1)
    console.info(`  set-cookie ${name} (${value === 'deleted' ? 'deleted' : `${value.length} chars`})`)
    if (value === 'deleted') jar.delete(name)
    else jar.set(name, value)
  })
}

const cookieHeader = () => [...jar].map(([name, value]) => `${name}=${value}`).join('; ')

const request = async (path: string, init: RequestInit = {}) => {
  let response = await fetch(new URL(path, BASE_URL), {
    ...init,
    headers: { ...init.headers, cookie: cookieHeader() },
    redirect: 'manual',
  })
  collectCookies(response)

  for (let hop = 0; hop < MAX_REDIRECTS && response.headers.has('location'); hop++) {
    const location = response.headers.get('location') ?? ''
    console.info(`  ${response.status} -> ${location}`)
    response = await fetch(new URL(location, BASE_URL), { headers: { cookie: cookieHeader() }, redirect: 'manual' })
    collectCookies(response)
  }
  return response
}

const login = prompt('Identifiant Item Solution :') ?? ''
const password = readSecret('Mot de passe :')

await request('/users/login')
const loginResponse = await request('/users/login', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ _method: 'POST', 'data[User][login]': login, 'data[User][password]': password }),
})
console.info(`Login final: HTTP ${loginResponse.status} ${loginResponse.url}`)

await mkdir(OUTPUT_DIR, { recursive: true })
for (const [name, path] of Object.entries(PAGES)) {
  const response = await request(path)
  const html = await response.text()
  await writeFile(`${OUTPUT_DIR}/${name}.html`, html)
  console.info(`${name}: HTTP ${response.status}, ${html.length} chars, login form: ${html.includes('formUserLogin')}`)
}

const financialsIndex = await Bun.file(`${OUTPUT_DIR}/financials-index.html`).text()
const accountIds = [...financialsIndex.matchAll(/<tr id="(account-\d+)" class="view-account"/g)].map(([, id]) => id)
for (const [index, accountId] of accountIds.entries()) {
  const response = await request(`/financials/view_account/${accountId}`)
  const html = await response.text()
  await writeFile(`${OUTPUT_DIR}/account-${index}.html`, html)
  console.info(`account-${index}: HTTP ${response.status}, ${html.length} chars`)
}

const documentsList = await Bun.file(`${OUTPUT_DIR}/documents-list.html`).text()
const personalDocumentId = documentsList.match(/<tr id="dfl(\d+)"[^>]*>(?:(?!<\/tr>)[\s\S])*?CIS\d+/)?.[1]
if (personalDocumentId) {
  const view = await request(`/docs/view/${personalDocumentId}`)
  await writeFile(`${OUTPUT_DIR}/document-view.html`, await view.text())
  console.info(`document-view: HTTP ${view.status}`)

  const file = await request(`/docs/get/${personalDocumentId}`)
  await writeFile(`${OUTPUT_DIR}/document-file.bin`, new Uint8Array(await file.arrayBuffer()))
  console.info(
    `document-file: HTTP ${file.status}, ${file.headers.get('content-type')}, ${file.headers.get('content-disposition')}, ${file.headers.get('content-length')} bytes`,
  )
}

const capture = async (name: string, path: string) => {
  const response = await request(path)
  const html = await response.text()
  await writeFile(`${OUTPUT_DIR}/${name}.html`, html)
  console.info(`${name}: HTTP ${response.status}, ${html.length} chars`)
  return html
}

const assembliesIndex = await Bun.file(`${OUTPUT_DIR}/assemblies-index.html`).text()
const assemblyIds = [...new Set([...assembliesIndex.matchAll(/\/assemblies\/view\/(\d+)/g)].map(([, id]) => id))].slice(0, 2)
for (const [index, assemblyId] of assemblyIds.entries()) {
  const assemblyView = await capture(`assembly-view-${index}`, `/assemblies/view/${assemblyId}`)
  await capture(`assembly-documents-${index}`, `/docs/ajax_assembly/${assemblyId}.json`)
  const resolutionPath = assemblyView.match(/\/aresolutions\/view\/\d+\?assembly=\d+/)?.[0]
  if (resolutionPath) await capture(`resolution-view-${index}`, resolutionPath)
}

const ticketsIndex = await Bun.file(`${OUTPUT_DIR}/tickets-index.html`).text()
const ticketIds = [...new Set([...ticketsIndex.matchAll(/TIS(\d+)/g)].map(([, id]) => id))].slice(0, 2)
for (const [index, ticketId] of ticketIds.entries()) {
  await capture(`ticket-view-${index}`, `/tickets/view/${ticketId}`)
}

if (personalDocumentId) {
  const preview = await request(`/docs/preview/${personalDocumentId}`)
  const bytes = (await preview.arrayBuffer()).byteLength
  console.info(`document-preview: HTTP ${preview.status}, ${preview.headers.get('content-type')}, ${bytes} bytes`)
}

await request('/users/logout')
