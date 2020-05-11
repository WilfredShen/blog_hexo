var pageContent = new Vue({
  el: '#page-content',
  data: {
    attributes: {
      inputTextarea: {
        maxRows: 10,
        value: '',
        title: '',
        placeholder: 'input'
      },
      outputTextarea: {
        maxRows: 10,
        value: '',
        title: '',
        placeholder: 'output'
      }
    },
    buttons: {
      convert: {
        value: 'convert',
        class: 'fa-angle-double-down',
        text: '转换'
      },
      swapCoding: {
        value: 'swapCoding',
        class: 'fa-exchange rotate90',
        text: '交换编码规则',
      }
    }
  },
  methods: {
    codingString: function (str) { return str },
    decodingIntHelp: function (str) { return parseInt(str, settings.attributes.inputCodingSelected.key) },
    decodingCharCodeHelp: function (c) { return c.charCodeAt() },
    decodingUTF8Help: function (str) { return decodeURI(str) },
    decodingUnicodeHelp: function (str) { return unescape(str) },
    encodingIntHelp: function (num) { return num.toString(settings.attributes.outputCodingSelected.key) },
    encodingCharCodeHelp: function (num) { return String.fromCharCode(num) },
    encodingUTF8Help: function (str) { return encodeURI(str) },
    encodingUnicodeHelp: function (str) { return escape(str) },
    decoding: function (str) { return str },
    encoding: function (str) { return str },
    codingInit: function () {
      if (settings.attributes.inputCodingSelected.key === 'string')
        this.decoding = this.codingString
      else if (settings.attributes.inputCodingSelected.key === 'charcode')
        this.decoding = this.decodingCharCodeHelp
      else if (settings.attributes.inputCodingSelected.key === 'utf8')
        this.decoding = this.decodingUTF8Help
      else if (settings.attributes.inputCodingSelected.key === 'unicode')
        this.decoding = this.decodingUnicodeHelp
      else
        this.decoding = this.decodingIntHelp

      if (settings.attributes.outputCodingSelected.key === 'string')
        this.encoding = this.codingString
      else if (settings.attributes.outputCodingSelected.key === 'charcode')
        this.encoding = this.encodingCharCodeHelp
      else if (settings.attributes.outputCodingSelected.key === 'utf8')
        this.encoding = this.encodingUTF8Help
      else if (settings.attributes.outputCodingSelected.key === 'unicode')
        this.encoding = this.encodingUnicodeHelp
      else
        this.encoding = this.encodingIntHelp
    },
    convert: function () {
      // generate ignore regex
      var ignoreRegexAttr = settings.attributes.ignoreSelected.attr
      try {
        var ignore = settings.attributes.ignoreSelected.key === 'custom' ?
          new RegExp(settings.attributes.ignoreSelected.value, ignoreRegexAttr) :
          ''
      } catch (error) {
        isSnackbarShow('Wrong ignore regex.')
        return
      }

      // generate input regex
      var inputRegexAttr = settings.attributes.inputSeparatorSelected.attr
      try {
        var inputSeparator = settings.attributes.inputSeparatorSelected.key === 'custom' ?
          new RegExp(settings.attributes.inputSeparatorSelected.value, inputRegexAttr) :
          settings.attributes.inputCodingSelected.inputSeparator
      } catch (error) {
        isSnackbarShow('Wrong separator regex.')
        return
      }

      // generate output separator
      var outputSeparator = settings.attributes.outputSeparatorSelected.key === 'custom' ?
        settings.attributes.outputSeparatorSelected.value :
        settings.attributes.outputCodingSelected.outputSeparator

      // initial coding function
      this.codingInit();

      // read input string
      var inputString = this.attributes.inputTextarea.value

      // apply ignore
      inputString = inputString.replace(ignore, '')

      // split -> decoding -> encoding -> merge
      var outputString = inputString.split(inputSeparator).map(this.decoding).map(this.encoding).join(outputSeparator)

      // write output stirng
      this.attributes.outputTextarea.value = outputString
    },
    swapCoding: function () {
      var coding = settings.attributes.inputCodingSelected
      settings.attributes.inputCodingSelected = settings.attributes.outputCodingSelected
      settings.attributes.outputCodingSelected = coding
    },
    handleeClick: function (key) {
      return this[key]()
    }
  },
})

var settings = new Vue({
  el: '#settings',
  data: {
    consts: {
      codings: {
        string: {
          text: 'String',
          inputSeparator: ' ',
          outputSeparator: ''
        },
        2: {
          text: '2 进制',
          inputSeparator: ' ',
          outputSeparator: ' '
        },
        4: {
          text: '4 进制',
          inputSeparator: ' ',
          outputSeparator: ' '
        },
        8: {
          text: '8 进制',
          inputSeparator: ' ',
          outputSeparator: ' '
        },
        10: {
          text: '10 进制',
          inputSeparator: ' ',
          outputSeparator: ' '
        },
        16: {
          text: '16 进制',
          inputSeparator: ' ',
          outputSeparator: ' '
        },
        charcode: {
          text: 'charCode',
          inputSeparator: '',
          outputSeparator: ''
        },
        utf8: {
          text: 'UTF-8',
          inputSeparator: ' ',
          outputSeparator: ''
        },
        unicode: {
          text: 'Unicode',
          inputSeparator: ' ',
          outputSeparator: ''
        }
      },
      ignoreOptions: ['default', 'custom'],
      separatorOptions: ['default', 'custom']
    },
    status: {
      inputCodingSelectEnabled: false,
      outputCodingSelectEnabled: false,
      ignoreSelectEnabled: false,
      inputSeparatorSelectEnabled: false,
      outputSeparatorSelectEnabled: false
    },
    attributes: {
      inputCodingSelected: {
        key: 2,
        text: '2 进制',
        separator: ' '
      },
      outputCodingSelected: {
        key: 10,
        text: '10 进制',
        separator: ' '
      },
      ignoreSelected: {
        key: 'default',
        value: '',
        bak: '',
        attr: '',
        placeholder: this.ignorePlaceholder,
        attrPlaceholder: 'attr',
      },
      inputSeparatorSelected: {
        key: 'default',
        value: '',
        bak: '',
        attr: '',
        placeholder: this.inputSeparatorPlaceholder,
        attrPlaceholder: 'attr'
      },
      outputSeparatorSelected: {
        key: 'default',
        value: '',
        bak: '',
        placeholder: this.outputSeparatorPlaceholder
      }
    }
  },
  computed: {
    ignorePlaceholder: function () {
      if (this.attributes.ignoreSelected.key === 'default')
        return 'none'
      else if (this.attributes.ignoreSelected.key === 'custom')
        return 'regex pattern'
      else
        return 'wrong'
    },
    inputSeparatorPlaceholder: function () {
      if (this.attributes.inputSeparatorSelected.key === 'default')
        return this.attributes.inputCodingSelected.key === 'charcode' ? 'none' : 'space'
      // return this.isCharCoding(this.attributes.inputCodingSelected.key) ? 'none' : 'space'
      else if (this.attributes.inputSeparatorSelected.key === 'custom')
        return 'regex pattern'
      else
        return 'wrong'
    },
    outputSeparatorPlaceholder: function () {
      // return this.attributes.outputSeparatorSelected.key === 'custom' ||
      //   this.attributes.outputCodingSelected.key === 'string' ||
      //   this.attributes.outputCodingSelected.key === 'charcode' ?
      //   'none' : 'space'
      return this.attributes.outputSeparatorSelected.key === 'custom' ||
        this.isCharCoding(this.attributes.outputCodingSelected.key) ?
        'none' : 'space'
    }
  },
  methods: {
    isCharCoding: function (str) {
      return isNaN(parseInt(str))
    },
    codingSelected: function (type, key) {
      if (type === 'input') {
        this.attributes.inputCodingSelected = this.consts.codings[key]
        this.attributes.inputCodingSelected.key = key
        this.status.inputCodingSelectEnabled = false
      } else if (type === 'output') {
        this.attributes.outputCodingSelected = this.consts.codings[key]
        this.attributes.outputCodingSelected.key = key
        this.status.outputCodingSelectEnabled = false
      }
    },
    ignoreSelected: function (key) {
      this.attributes.ignoreSelected.key = key
      this.status.ignoreSelectEnabled = false
      if (key === 'default') {
        this.attributes.ignoreSelected.bak = this.attributes.ignoreSelected.value
        this.attributes.ignoreSelected.value = ''
      } else if (key === 'custom') {
        this.attributes.ignoreSelected.value = this.attributes.ignoreSelected.bak
      }
    },
    separatorSelected: function (type, key) {
      if (type === 'input') {
        this.attributes.inputSeparatorSelected.key = key
        this.status.inputSeparatorSelectEnabled = false
        if (key === 'default') {
          this.attributes.inputSeparatorSelected.bak = this.attributes.inputSeparatorSelected.value
          this.attributes.inputSeparatorSelected.value = ''
        } else if (key === 'custom') {
          this.attributes.inputSeparatorSelected.value = this.attributes.inputSeparatorSelected.bak
        }
      } else if (type === 'output') {
        this.attributes.outputSeparatorSelected.key = key
        this.status.outputSeparatorSelectEnabled = false
        if (key === 'default') {
          this.attributes.outputSeparatorSelected.bak = this.attributes.outputSeparatorSelected.value
          this.attributes.outputSeparatorSelected.value = ''
        } else if (key === 'custom') {
          this.attributes.outputSeparatorSelected.value = this.attributes.outputSeparatorSelected.bak
        }
      }
    }
  },
})