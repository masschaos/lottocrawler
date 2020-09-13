class CSV {
  constructor (initData, options = {}) {
    this.titlesLength = initData.titlesLength
    this.maxLength = initData.maxLength
    this.rowsNumber = initData.rowsNumber
    this.titles = initData.titles
    this.rows = initData.rows

    this.options = options
    this.separator = options.separator || ','
  }

  _isColon (word) {
    return word === '"' || word === '\''
  }

  _dealLine (text, separator = ',') {
    const items = []
    const colonStack = []

    let tmp = ''

    for (let i = 0; i < text.length; i++) {
      const word = text[i]
      if (this._isColon(word)) {
        const last = colonStack.pop()
        if (last !== word) {
          colonStack.push(last)
          tmp += word
        }
        continue
      }

      if (colonStack.length === 0 && word === separator) {
        items.push(tmp)
        tmp = ''
        continue
      }
      tmp += word
    }
    items.push(tmp)
    return items
  }

  export () {
    const title = this.titles.join(this.separator)
    const rowsText = this.rows.map(row => row.map(block =>
      block.indexOf(this.separator > 0) ? `"${block}"` : block
    ).join(this.separator)).join('\n')
    return `${title}\n${rowsText}\n`
  }

  getTitle () {
    return this.titles
  }

  getRow (rowNo, withName) {
    if (rowNo < 1 || rowNo > this.rowsNumber) {
      return []
    }

    const row = this.rows[rowNo - 1]

    if (!withName) {
      const result = []
      for (let i = 0; i < this.maxLength; i++) {
        result.push(row[i] || '')
      }
      return result
    }
    const result = []
    for (let i = 0; i < this.maxLength; i++) {
      result.push({
        name: this.titles[i] || '',
        value: row[i] || ''
      })
    }
    return result
  }

  getRows (withName) {
    const ids = []
    for (let i = 1; i < this.rowsNumber + 1; i++) {
      ids.push(i)
    }
    return ids.map(id => this.getRow(id, withName))
  }

  getValue (rowNo, itemNo, withName) {
    if (rowNo > this.rowsNumber ||
      itemNo > this.maxLength ||
      rowNo < 1 ||
      itemNo < 1) {
      return ''
    }
    const value = this.rows[rowNo - 1][itemNo - 1] || ''
    if (withName) {
      return {
        name: this.titles[itemNo - 1],
        value
      }
    }
    return value
  }

  getValueByTitle (title, rowNo, withName) {
    const index = this.titles.indexOf(title)
    if (index < 0) return null // 返回 null 区分 ''

    return this.getValue(rowNo, index + 1, withName)
  }

  getMaxRowsNum () {
    return this.rowsNumber
  }

  appendRows (items) {
    this.rowsNumber++
    this.rows.push(items)
  }

  appendRowsByText (text, separator = ',') {
    const items = this._dealLine(text, separator)
    this.appendRows(items)
  }
}

module.exports = CSV
