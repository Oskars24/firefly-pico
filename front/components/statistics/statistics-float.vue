<template>
    <div v-if="isOnTransactionsPage">
        <van-floating-bubble v-model:offset="position" axis="y" magnetic="x" :gap="0" class="statistics-floating-button"
            @click="isStatsVisible = true">
            <icon-device-desktop-analytics size="20" color="#fff" stroke="1.6" />
        </van-floating-bubble>

        <van-popup v-model:show="isStatsVisible" position="bottom" :style="{ height: '70%' }">
            <div class="statistics-popup">
                <div class="statistics-header">
                    <h3 class="app-toolbar-title">{{ getStatisticsTitle() }}</h3>
                    <van-button type="primary" size="small" @click="isStatsVisible = false">
                        {{ $t('close') }}
                    </van-button>
                </div>

                <div class="statistics-content">
                    <div v-if="isLoading" class="loading-container">
                        <van-loading type="spinner" color="#1989fa" />
                        <p>{{ $t('statistics.loading') }}</p>
                    </div>

                    <div v-else class="statistics-sections">
                        <!-- Debug info -->
                        <div class="debug-info">
                            <small>
                                Transakcje: {{ statisticsStore.currentTransactions.length }}<br>
                                Tagi: {{ tagStats.length }}<br>
                                Kategorie: {{ categoryStats.length }}
                            </small>
                        </div>

                        <!-- Brak danych -->
                        <div v-if="tagStats.length === 0 && categoryStats.length === 0" class="no-data-container">
                            <p>{{ $t('statistics.no_data') }}</p>
                            <p><small>Liczba transakcji: {{ statisticsStore.currentTransactions.length }}</small></p>
                        </div>

                        <!-- Statystyki tagów -->
                        <div v-if="tagStats.length > 0" class="stats-section">
                            <h4>{{ $t('statistics.tags') }}</h4>
                            <div class="stats-list">
                                <div v-for="tagStat in tagStats" :key="tagStat.id" class="stat-item"
                                    :class="{ 'main-tag': tagStat.isMainTag }">
                                    <div class="stat-icon">
                                        <app-icon :icon="getTagIcon(tagStat)" size="24" />
                                    </div>
                                    <div class="stat-details">
                                        <div class="stat-name-container">
                                            <span class="stat-name">{{ getTagName(tagStat) }}</span>
                                            <span v-if="tagStat.isMainTag" class="main-tag-badge">{{
                                                $t('statistics.main_tag') }}</span>
                                        </div>
                                        <div class="stat-amounts">
                                            <div v-if="tagStat.income > 0" class="stat-amount income">
                                                <span class="amount-label">{{ $t('statistics.income') }}:</span>
                                                <span class="amount-value">+{{ formatAmount(tagStat.income) }}</span>
                                            </div>
                                            <div v-if="tagStat.expense > 0" class="stat-amount expense">
                                                <span class="amount-label">{{ $t('statistics.expense') }}:</span>
                                                <span class="amount-value">-{{ formatAmount(tagStat.expense) }}</span>
                                            </div>
                                            <div v-if="tagStat.transfer > 0" class="stat-amount transfer">
                                                <span class="amount-label">{{ $t('statistics.transfer') }}:</span>
                                                <span class="amount-value">{{ formatAmount(tagStat.transfer) }}</span>
                                            </div>
                                            <div v-if="(tagStat.income > 0 || tagStat.expense > 0) && getTagBalance(tagStat) !== 0"
                                                class="stat-amount balance"
                                                :class="{ 'positive': getTagBalance(tagStat) > 0, 'negative': getTagBalance(tagStat) < 0 }">
                                                <span class="amount-label">{{ $t('statistics.balance') }}:</span>
                                                <span class="amount-value">{{ getTagBalance(tagStat) > 0 ? '+' : '-'
                                                    }}{{ formatAmount(Math.abs(getTagBalance(tagStat))) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Statystyki kategorii -->
                        <div v-if="categoryStats.length > 0" class="stats-section">
                            <h4>{{ $t('statistics.categories') }}</h4>
                            <div class="stats-list">
                                <div v-for="categoryStat in categoryStats" :key="categoryStat.id" class="stat-item">
                                    <div class="stat-icon">
                                        <app-icon :icon="getCategoryIcon(categoryStat)" size="24" />
                                    </div>
                                    <div class="stat-details">
                                        <span class="stat-name">{{ getCategoryName(categoryStat) }}</span>
                                        <div class="stat-amounts">
                                            <div v-if="categoryStat.income > 0" class="stat-amount income">
                                                <span class="amount-label">{{ $t('statistics.income') }}:</span>
                                                <span class="amount-value">+{{ formatAmount(categoryStat.income)
                                                    }}</span>
                                            </div>
                                            <div v-if="categoryStat.expense > 0" class="stat-amount expense">
                                                <span class="amount-label">{{ $t('statistics.expense') }}:</span>
                                                <span class="amount-value">-{{ formatAmount(categoryStat.expense)
                                                    }}</span>
                                            </div>
                                            <div v-if="categoryStat.transfer > 0" class="stat-amount transfer">
                                                <span class="amount-label">{{ $t('statistics.transfer') }}:</span>
                                                <span class="amount-value">{{ formatAmount(categoryStat.transfer)
                                                    }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<script setup>
import { IconDeviceDesktopAnalytics } from '@tabler/icons-vue'
import TablerIconConstants from '~/constants/TablerIconConstants'
import Tag from '~/models/Tag'
import Category from '~/models/Category'
import LanguageUtils from '~/utils/LanguageUtils'
import { useWindowSize } from '@vueuse/core'

const appStore = useAppStore()
const statisticsStore = useStatisticsStore()
const dataStore = useDataStore()
const { t } = useI18n()
const route = useRoute()

const isLoading = ref(false)

// Sprawdź czy jesteśmy na stronie transakcji
const isOnTransactionsPage = computed(() => {
    return route.path.includes('/transactions')
})

const { width } = useWindowSize()

// Pozycja floating button - na dole pod profile button
const position = computed({
    get: () => ({
        x: width.value - 40,
        y: appStore.profileFloatButtonPosition.y + 80 // 80px niżej od profile button
    }),
    set: (value) => {
        // Zapisz pozycję względem profile button
        appStore.statisticsFloatButtonPosition = {
            y: value.y - 80
        }
    },
})

// Synchronizuj widoczność z store
const isStatsVisible = computed({
    get: () => statisticsStore.isVisible,
    set: (value) => {
        if (value) {
            statisticsStore.show()
        } else {
            statisticsStore.hide()
        }
    }
})

// Tytul statystyk
const getStatisticsTitle = () => {
    const filters = statisticsStore.currentFilters

    // Sprawdź czy okres dat jest wybrany
    const hasDateFilter = filters.dateAfter || filters.dateBefore
    let title = hasDateFilter ? t('statistics.summary_for_period') : t('statistics.summary_for_current_transactions')

    // Dodaj informacje o filtrach
    const filterInfo = []

    if (filters.dateAfter || filters.dateBefore) {
        const fromDate = filters.dateAfter ? new Date(filters.dateAfter).toLocaleDateString() : '...'
        const toDate = filters.dateBefore ? new Date(filters.dateBefore).toLocaleDateString() : '...'
        filterInfo.push(`${fromDate} - ${toDate}`)
    }

    if (filters.tag) {
        filterInfo.push(`${t('tag')}: ${getTagDisplayName(filters.tag)}`)
    }

    if (filters.category) {
        filterInfo.push(`${t('category')}: ${getCategoryDisplayName(filters.category)}`)
    }

    if (filters.budget) {
        filterInfo.push(`${t('budget')}: ${getBudgetDisplayName(filters.budget)}`)
    }

    if (filterInfo.length > 0) {
        title += ` (${filterInfo.join(', ')})`
    }

    return title
}

// Oblicz statystyki po otwarciu popupu
watch(isStatsVisible, (newValue) => {
    if (newValue) {
        console.log('Stats panel opened')
    }
})

// Computed properties dla statystyk
const tagStats = computed(() => {
    try {
        const transactions = statisticsStore.currentTransactions || []
        const filters = statisticsStore.currentFilters || {}

        console.log('Computing tag statistics for', transactions.length, 'transactions')
        console.log('Selected tag filter:', filters.tag)

        // Sprawdź czy w filtrach jest wybrany tag główny
        const selectedTag = filters.tag

        // Oblicz statystyki tagów
        const tagMap = new Map()

        // ZAWSZE pokaż wszystkie tagi (bez względu na filtry)
        // ale tylko z transakcji które pasują do filtrów
        transactions.forEach(transaction => {
            // Pobierz pierwszą transakcję z grupy
            const txData = transaction.attributes?.transactions?.[0]
            if (!txData) return

            const tags = txData.tags || []
            const amount = parseFloat(txData.amount || 0)
            const type = txData.type?.fireflyCode || txData.type // Użyj fireflyCode z obiektu type

            // Jeśli jest wybrany tag w filtrach, sprawdź czy transakcja go ma
            // (ale nadal pokaż wszystkie tagi z tej transakcji)
            if (selectedTag) {
                const hasMainTag = tags.some(tagObj => tagObj.attributes?.tag === selectedTag.attributes?.tag)
                if (!hasMainTag) {
                    // Pomiń transakcje które nie mają wybranego tagu
                    return
                }
            }

            // Debug: sprawdź strukturę danych
            if (transactions.indexOf(transaction) === 0) {
                console.log('Sample transaction data:', {
                    txData,
                    type: txData.type,
                    amount: txData.amount,
                    tags: tags.map(t => t.attributes?.tag),
                    selectedTag: selectedTag?.attributes?.tag,
                    hasSelectedTag: selectedTag ? tags.some(tagObj => tagObj.attributes?.tag === selectedTag.attributes?.tag) : 'no filter'
                })
            }

            console.log('Processing transaction:', {
                typeObject: txData.type,
                fireflyCode: txData.type?.fireflyCode,
                finalType: type,
                amount,
                tagNames: tags.map(t => t.attributes?.tag),
                selectedTagFilter: selectedTag?.attributes?.tag
            })

            // Dodaj wszystkie tagi z tej transakcji do statystyk
            tags.forEach(tagObj => {
                const tagName = tagObj.attributes?.tag
                if (!tagName) return // Pomiń tagi bez nazwy

                if (!tagMap.has(tagName)) {
                    tagMap.set(tagName, {
                        id: tagName,
                        tag: tagName, // Przechowuj nazwę jako string
                        income: 0,      // Przychody
                        expense: 0,     // Wydatki
                        transfer: 0,    // Transfery
                        count: 0,
                        isMainTag: selectedTag && tagName === selectedTag.attributes?.tag
                    })
                }

                const tagStat = tagMap.get(tagName)

                // Sumuj według typu transakcji
                if (type === 'deposit') {
                    tagStat.income += Math.abs(amount)
                    console.log(`Added income ${Math.abs(amount)} to tag ${tagName}, total: ${tagStat.income}`)
                } else if (type === 'withdrawal') {
                    tagStat.expense += Math.abs(amount)
                    console.log(`Added expense ${Math.abs(amount)} to tag ${tagName}, total: ${tagStat.expense}`)
                } else if (type === 'transfer') {
                    tagStat.transfer += Math.abs(amount)
                    console.log(`Added transfer ${Math.abs(amount)} to tag ${tagName}, total: ${tagStat.transfer}`)
                } else {
                    console.log(`Unknown transaction type: ${type} for tag ${tagName}`)
                }

                tagStat.count += 1
            })
        })

        // Sortuj tagi: główny tag na górze, potem inne po łącznej wartości (malejąco)
        const result = Array.from(tagMap.values())
            .sort((a, b) => {
                if (a.isMainTag && !b.isMainTag) return -1
                if (!a.isMainTag && b.isMainTag) return 1
                const totalA = a.income + a.expense + a.transfer
                const totalB = b.income + b.expense + b.transfer
                return totalB - totalA
            })

        console.log('Tag stats result:', result.length, 'tags')
        return result
    } catch (error) {
        console.error('Error calculating tag stats:', error)
        return []
    }
})

const categoryStats = computed(() => {
    try {
        const transactions = statisticsStore.currentTransactions || []

        console.log('Computing category statistics for', transactions.length, 'transactions')

        const categoryMap = new Map()

        transactions.forEach(transaction => {
            // Pobierz pierwszą transakcję z grupy
            const txData = transaction.attributes?.transactions?.[0]
            if (!txData) return

            const categoryName = txData.category_name
            const amount = parseFloat(txData.amount || 0)
            const type = txData.type?.fireflyCode || txData.type // Użyj fireflyCode z obiektu type

            if (categoryName) {
                if (!categoryMap.has(categoryName)) {
                    categoryMap.set(categoryName, {
                        id: categoryName,
                        category: categoryName, // Przechowuj nazwę jako string
                        income: 0,      // Przychody
                        expense: 0,     // Wydatki
                        transfer: 0,    // Transfery
                        count: 0
                    })
                }

                const categoryStat = categoryMap.get(categoryName)

                // Sumuj według typu transakcji
                if (type === 'deposit') {
                    categoryStat.income += Math.abs(amount)
                } else if (type === 'withdrawal') {
                    categoryStat.expense += Math.abs(amount)
                } else if (type === 'transfer') {
                    categoryStat.transfer += Math.abs(amount)
                }

                categoryStat.count += 1
            }
        })

        // Sortuj kategorie po łącznej wartości (malejąco)
        const result = Array.from(categoryMap.values())
            .sort((a, b) => {
                const totalA = a.income + a.expense + a.transfer
                const totalB = b.income + b.expense + b.transfer
                return totalB - totalA
            })

        console.log('Category stats result:', result.length, 'categories')
        return result
    } catch (error) {
        console.error('Error calculating category stats:', error)
        return []
    }
})

// Helper functions
const getTagIcon = (tagStat) => {
    // Znajdź pełny obiekt tagu po nazwie
    const tagName = typeof tagStat.tag === 'string' ? tagStat.tag : tagStat.tag?.attributes?.tag
    const normalizedName = LanguageUtils.removeAccentsAndLowerCase(tagName)
    const fullTagObject = dataStore.tagDictionaryByName[normalizedName]

    if (fullTagObject) {
        return Tag.getIcon(fullTagObject) ?? TablerIconConstants.tag
    }
    return TablerIconConstants.tag
}

const getTagName = (tagStat) => {
    // Jeśli tag to string (nazwa), zwróć ją
    if (typeof tagStat.tag === 'string') {
        return tagStat.tag
    }
    // Jeśli tag to obiekt, zwróć tag.attributes.tag
    return tagStat.tag?.attributes?.tag || tagStat.id || 'Unknown Tag'
}

const getTagBalance = (tagStat) => {
    // Bilans = przychód - wydatek (nie uwzględniamy transferów w bilansie)
    return tagStat.income - tagStat.expense
}

const getCategoryIcon = (categoryStat) => {
    // Znajdź pełny obiekt kategorii po nazwie
    const categoryName = typeof categoryStat.category === 'string' ? categoryStat.category : categoryStat.category?.attributes?.name

    // Sprawdź czy jest w dataStore (dataStore może mieć categoryDictionary)
    const categoryList = dataStore.categoryList || []
    const fullCategoryObject = categoryList.find(cat => cat.attributes?.name === categoryName)

    if (fullCategoryObject) {
        return Category.getIcon(fullCategoryObject) ?? TablerIconConstants.category
    }
    return TablerIconConstants.category
}

const getCategoryName = (categoryStat) => {
    // Jeśli category to string (nazwa), zwróć ją
    if (typeof categoryStat.category === 'string') {
        return categoryStat.category
    }
    // Jeśli category to obiekt, zwróć category.attributes.name
    return categoryStat.category?.attributes?.name || categoryStat.id || 'Unknown Category'
}

const formatAmount = (amount) => {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN'
    }).format(amount)
}

const getTagDisplayName = (tag) => {
    return tag?.attributes?.tag || tag?.tag || 'Unknown'
}

const getCategoryDisplayName = (category) => {
    return category?.attributes?.name || category?.name || 'Unknown'
}

const getBudgetDisplayName = (budget) => {
    return budget?.attributes?.name || budget?.name || 'Unknown'
}

// Initialize position if not exists
onMounted(() => {
    if (!appStore.statisticsFloatButtonPosition) {
        appStore.statisticsFloatButtonPosition = { y: 200 }
    }
})
</script>

<style scoped>
.statistics-floating-button {
    background: #2196f3 !important;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.statistics-popup {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

.statistics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
}

.statistics-header .app-toolbar-title {
    font-size: 16px;
    /* Taki sam jak var(--van-nav-bar-title-font-size) */
}

/* Tryb ciemny dla statistics-header */
.van-theme-dark .statistics-header {
    border-bottom: 1px solid #444;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #666;
}

.stats-section {
    margin-bottom: 30px;
}

.stats-section h4 {
    margin: 0 0 15px 0;
    font-size: 14px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
}

.stats-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.stat-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

/* Tryb ciemny dla stat-item */
.van-theme-dark .stat-item {
    background: #2c2c2c;
    border-color: #555;
}

.stat-item.main-tag {
    background: #e3f2fd;
    border-color: #2196f3;
    box-shadow: 0 2px 4px rgba(33, 150, 243, 0.1);
}

/* Tryb ciemny dla main-tag */
.van-theme-dark .stat-item.main-tag {
    background: #1a2332;
    border-color: #2196f3;
}

.stat-icon {
    margin-right: 12px;
    color: #666;
}

/* Tryb ciemny dla ikony */
.van-theme-dark .stat-icon {
    color: #ccc;
}

.stat-details {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-name-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stat-name {
    font-weight: 500;
    color: #333;
}

/* Tryb ciemny dla nazwy */
.van-theme-dark .stat-name {
    color: #fff;
}

.main-tag-badge {
    font-size: 12px;
    color: #2196f3;
    font-weight: 600;
    text-transform: uppercase;
}

.stat-amount {
    font-weight: 600;
    color: #2196f3;
}

.stat-amounts {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stat-amount {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
}

.amount-label {
    font-size: 12px;
    opacity: 0.8;
    min-width: 70px;
}

.amount-value {
    font-weight: 600;
}

/* Kolory dla różnych typów */
.stat-amount.income .amount-value {
    color: #4caf50;
    /* Zielony dla przychodów */
}

.stat-amount.expense .amount-value {
    color: #f44336;
    /* Czerwony dla wydatków */
}

.stat-amount.transfer .amount-value {
    color: #2196f3;
    /* Niebieski dla transferów */
}

.stat-amount.balance .amount-value {
    font-weight: bold;
}

.stat-amount.balance.positive .amount-value {
    color: #4caf50;
    /* Zielony dla dodatniego bilansu */
}

.stat-amount.balance.negative .amount-value {
    color: #f44336;
    /* Czerwony dla ujemnego bilansu */
}

.debug-info {
    margin-bottom: 20px;
    padding: 10px;
    background: #f0f0f0;
    border-radius: 4px;
    color: #333;
}

/* Tryb ciemny dla debug-info */
.van-theme-dark .debug-info {
    background: #2c2c2c;
    color: #ccc;
}

.statistics-floating-button {
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-bottom-right-radius: 10px !important;
    border-top-right-radius: 10px !important;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    background: #1E88E5 !important;
}

/* Bardziej specyficzny selektor dla elementu wewnętrznego */
.statistics-floating-button :deep(.van-floating-bubble) {
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-bottom-right-radius: 10px !important;
    border-top-right-radius: 10px !important;
}

/* Jeszcze bardziej specyficzny selektor */
.statistics-floating-button :deep(.van-floating-bubble__content) {
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-bottom-right-radius: 10px !important;
    border-top-right-radius: 10px !important;
}
</style>