const form = document.querySelector('#transfer')
const keyField = document.querySelector('#key-field')
const key = form.elements.namedItem('key')
const secret = form.elements.namedItem('secret')
const secretLabel = document.querySelector('#secret-label')
const submit = form.querySelector('[type="submit"]')
const cancel = document.querySelector('#cancel')
const status = document.querySelector('#status')
const pickers = [...form.querySelectorAll('[data-pick]')]
const historyKey = 'xc2f-scp-last-transfer'
const rememberedFields = [
  'source',
  'host',
  'port',
  'user',
  'destination',
  'auth',
  'key',
  'direction',
  'remoteType',
]
let activeTransfer
let picking = false

function updateDirection() {
  const downloading = form.elements.namedItem('direction').value === 'download'
  document.querySelector('#source-heading').textContent = downloading ? '本机目标' : '本机来源'
  document.querySelector('#target-heading').textContent = downloading ? '来源服务器' : '目标服务器'
  document.querySelector('#local-label').textContent = downloading
    ? '保存到本机目录'
    : '文件或目录路径'
  document.querySelector('#remote-label').textContent = downloading
    ? '远端文件或目录路径'
    : '目标目录'
  document.querySelector('#pick-file').hidden = downloading
  document.querySelector('#remote-type').hidden = !downloading
  document.querySelector('#local-hint').textContent = downloading
    ? '请选择已存在且可写的目录。同名文件可能被覆盖。'
    : '目录会递归复制。SCP 会跟随目录中的符号链接。'
  document.querySelector('#remote-hint').textContent = downloading
    ? '填写远端绝对路径，并选择来源类型。目录会递归下载。'
    : '目标目录须已存在且可写。同名文件可能被覆盖。'
  submit.textContent = downloading ? '开始下载' : '开始上传'
}

function updateAuth() {
  const usesKey = form.elements.namedItem('auth').value === 'pem'
  keyField.hidden = !usesKey
  key.disabled = !usesKey
  key.required = usesKey
  secret.required = !usesKey
  secretLabel.textContent = usesKey ? '私钥口令（如有）' : 'SSH 密码'
}

try {
  const previous = JSON.parse(localStorage.getItem(historyKey))
  for (const name of rememberedFields) {
    const value = previous?.[name]
    if (typeof value !== 'string') continue
    if (name === 'auth' && value !== 'pem' && value !== 'password') continue
    if (name === 'direction' && value !== 'upload' && value !== 'download') continue
    if (name === 'remoteType' && value !== 'file' && value !== 'directory') continue
    form.elements.namedItem(name).value = value
  }
} catch {
  // The form remains usable if storage is unavailable.
}

for (const radio of form.querySelectorAll('[name="auth"]')) {
  radio.addEventListener('change', () => {
    secret.value = ''
    updateAuth()
  })
}
updateAuth()
for (const radio of form.querySelectorAll('[name="direction"]')) {
  radio.addEventListener('change', updateDirection)
}
updateDirection()

for (const picker of pickers) {
  picker.addEventListener('click', async () => {
    if (activeTransfer || picking) return
    picking = true
    submit.disabled = true
    for (const button of pickers) button.disabled = true
    status.removeAttribute('data-error')
    status.textContent = '请在系统窗口选择路径…'
    try {
      const response = await fetch('/pick-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: picker.dataset.pick }),
      })
      const result = await response.json()
      if (result.path) {
        const field = picker.dataset.pick === 'pem' ? key : form.elements.namedItem('source')
        field.value = result.path
      }
      status.toggleAttribute('data-error', !response.ok)
      status.textContent = result.message
    } catch {
      status.setAttribute('data-error', '')
      status.textContent = '无法连接本机服务，请直接填写路径或重试。'
    } finally {
      picking = false
      submit.disabled = false
      for (const button of pickers) button.disabled = false
    }
  })
}

cancel.addEventListener('click', () => activeTransfer?.abort())

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (activeTransfer || picking) return

  const data = Object.fromEntries(new FormData(form))
  try {
    const previous = Object.fromEntries(
      rememberedFields.map((name) => [name, form.elements.namedItem(name).value]),
    )
    localStorage.setItem(historyKey, JSON.stringify(previous))
  } catch {
    // Sending the transfer does not depend on browser storage.
  }
  const transfer = new AbortController()
  activeTransfer = transfer
  submit.disabled = true
  for (const picker of pickers) picker.disabled = true
  cancel.hidden = false
  status.removeAttribute('data-error')
  status.textContent = '正在传输…'

  try {
    const response = await fetch('/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: transfer.signal,
    })
    const result = await response.json()
    status.toggleAttribute('data-error', !response.ok)
    status.textContent = result.message
  } catch {
    status.toggleAttribute('data-error', !transfer.signal.aborted)
    status.textContent = transfer.signal.aborted
      ? '已取消。目标目录可能保留已传输的内容。'
      : '与本机服务的连接已断开，请检查终端后重试。'
  } finally {
    form.elements.namedItem('secret').value = ''
    activeTransfer = undefined
    submit.disabled = false
    for (const picker of pickers) picker.disabled = false
    cancel.hidden = true
  }
})
