import BaseRepository from '~/repository/BaseRepository'
import axios from 'axios'
import { get } from 'lodash'

export default class TransactionRepository extends BaseRepository {
  constructor() {
    super(`api/transactions`)
    this.searchTransaction = this.searchTransaction.bind(this)
  }

  async getAll({ filters = [], page = 1, pageSize = 50 } = {}) {
    // Dodaj include dla tags i categories
    const includeFilter = {
      field: 'include',
      value: 'tags,category'
    }
    const allFilters = [...filters, includeFilter]
    
    let url = this.getUrlForRequest({ filters: allFilters, page, pageSize })
    let response = await axios.get(url)
    return get(response, 'data', {})
  }

  async searchTransaction({ filters = [], page = 1, pageSize = 50 } = {}) {
    // Dodaj include dla tags i categories
    const includeFilter = {
      field: 'include',
      value: 'tags,category'
    }
    const allFilters = [...filters, includeFilter]
    
    const appStore = useAppStore()
    const url = `${appStore.picoBackendURL}/api/search/transactions`
    let searchUrl = this.getUrlForRequest({ filters: allFilters, page, pageSize, url })
    let response = await axios.get(searchUrl)
    return get(response, 'data', {})
  }
}

