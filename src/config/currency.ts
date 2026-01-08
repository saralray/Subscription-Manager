/**
 * 货币系统中央配置
 * 统一管理基础货币设置，避免硬编码分散在各个文件中
 */

// 支持的货币类型
export type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'TRY' | 'HKD' | 'THB';

// 所有支持的货币列表（固定不变）
const ALL_SUPPORTED_CURRENCIES: CurrencyType[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'TRY', 'HKD', 'THB'];

// 基础货币配置 - 修改这里就能改变整个系统的基础货币
export const BASE_CURRENCY: CurrencyType = 'CNY';

// 支持的货币列表（基础货币在前，其他按字母排序）
export const SUPPORTED_CURRENCIES: CurrencyType[] = [
  BASE_CURRENCY,
  ...ALL_SUPPORTED_CURRENCIES.filter(currency => currency !== BASE_CURRENCY).sort()
];

// 货币信息映射（固定不变）
export const CURRENCY_INFO: Record<CurrencyType, { name: string; symbol: string }> = {
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  TRY: { name: 'Turkish Lira', symbol: '₺' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
  THB: { name: 'Thai Baht', symbol: '฿' }
};

// 基础汇率配置 - 根据基础货币动态生成
const BASE_RATES: Record<CurrencyType, Record<CurrencyType, number>> = {
  CNY: {
    CNY: 1,
    USD: 0.1538,
    EUR: 0.1308,
    GBP: 0.1154,
    CAD: 0.1923,
    AUD: 0.2077,
    JPY: 16.9231,
    TRY: 4.2000,
    HKD: 1.1923,
    THB: 5.4900
  },
  USD: {
    USD: 1,
    CNY: 6.5000,
    EUR: 0.8500,
    GBP: 0.7500,
    CAD: 1.2500,
    AUD: 1.3500,
    JPY: 110.0000,
    TRY: 27.0000,
    HKD: 7.8000,
    THB: 35.7000
  },
  EUR: {
    EUR: 1,
    USD: 1.1765,
    CNY: 7.6471,
    GBP: 0.8824,
    CAD: 1.4706,
    AUD: 1.5882,
    JPY: 129.4118,
    TRY: 31.7647,
    HKD: 9.1765,
    THB: 42.0000
  },
  GBP: {
    GBP: 1,
    USD: 1.3333,
    CNY: 8.6667,
    EUR: 1.1333,
    CAD: 1.6667,
    AUD: 1.8000,
    JPY: 146.6667,
    TRY: 36.0000,
    HKD: 10.3333,
    THB: 47.6000
  },
  CAD: {
    CAD: 1,
    USD: 0.8000,
    CNY: 5.2000,
    EUR: 0.6800,
    GBP: 0.6000,
    AUD: 1.0800,
    JPY: 88.0000,
    TRY: 21.6000,
    HKD: 6.2400,
    THB: 28.5600
  },
  AUD: {
    AUD: 1,
    USD: 0.7407,
    CNY: 4.8148,
    EUR: 0.6296,
    GBP: 0.5556,
    CAD: 0.9259,
    JPY: 81.4815,
    TRY: 20.0000,
    HKD: 5.7778,
    THB: 26.4444
  },
  JPY: {
    JPY: 1,
    USD: 0.0091,
    CNY: 0.0591,
    EUR: 0.0077,
    GBP: 0.0068,
    CAD: 0.0114,
    AUD: 0.0123,
    TRY: 0.2455,
    HKD: 0.0667,
    THB: 0.3245
  },
  TRY: {
    TRY: 1,
    USD: 0.0370,
    CNY: 0.2381,
    EUR: 0.0315,
    GBP: 0.0278,
    CAD: 0.0463,
    AUD: 0.0500,
    JPY: 4.0741,
    HKD: 0.2889,
    THB: 1.3222
  },
  HKD: {
    HKD: 1,
    USD: 0.1282,
    CNY: 0.8387,
    EUR: 0.1089,
    GBP: 0.0965,
    CAD: 0.1603,
    AUD: 0.1731,
    JPY: 14.1026,
    TRY: 3.4615,
    THB: 4.5769
  },
  THB: {
    THB: 1,
    USD: 0.0280,
    CNY: 0.1822,
    EUR: 0.0238,
    GBP: 0.0210,
    CAD: 0.0350,
    AUD: 0.0378,
    JPY: 3.0800,
    TRY: 0.7563,
    HKD: 0.2185
  }
};

// 默认汇率（根据基础货币动态获取）
export const DEFAULT_EXCHANGE_RATES: Record<CurrencyType, number> = BASE_RATES[BASE_CURRENCY];

// 工具函数
export const isBaseCurrency = (currency: string): boolean => currency === BASE_CURRENCY;
export const getBaseCurrency = (): CurrencyType => BASE_CURRENCY;
export const getCurrencySymbol = (currency: CurrencyType): string => CURRENCY_INFO[currency]?.symbol || currency;
export const getCurrencyName = (currency: CurrencyType): string => CURRENCY_INFO[currency]?.name || currency;