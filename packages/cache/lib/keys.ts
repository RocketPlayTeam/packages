import { createHmac } from 'crypto';

export function makeUserCK (userId: string) {
  return `cache_user_public_${userId}`;
}

export function makeRefreshTokenCK (token: string) {
  return `auth_refreshTokens_${token}`;
}

export function mapKeysMapCK (map: string) {
  return `keys_for_${map}`;
}

export function makeTarkovItemCK (itemId: string) {
  return `tarkov_market_item_${itemId}_cache`;
}

export function makeRawTarkovItemCK (itemId: string) {
  return `tarkov_market__wtf_item_${itemId}_raw_cache`;
}

export function makeTarkovItemPriceCK (itemId: string) {
  return `tarkov_market_item_price_${itemId}_cache`;
}

export function makeSocketTOCK (socketId: string) {
  return `socket_lastping_has_${socketId}`;
}

export function makeItemPageCK (page: number) {
  return `item_list_cache_p${page}_flea`;
}

export function makeMultiFetchCK (ids: string[]) {
  const long = ids.join('');
  return `cache_items_multifetch_${createHmac('sha256', 'cache_items_multifetch').update(long).digest('hex')}`;
}

export function makeSearchItemBNCK (name: string) {
  return `cache_byname_${createHmac('sha256', 'cache_item_name_search').update(name).digest('hex')}`;
}

export function makeGetPbySCK (postSlug: string) {
  return `cache_post_search_byslug_${postSlug}`;
}

export function makeContentSlugFindCK (slug: string) {
  return `cache_checkforcontentbyslug_${slug}`;
}

export function makePublicTaskCK (id: string) {
  return `cache_publictask__${id}`;
}

export function makeEditableTaskCK (id: string) {
  return `cache_editabletaskadmin__${id}`;
}

export function makeSmartSearchCK (query: string) {
  return `smartsearch_cache_${query}_result`;
}