// Серверное состояние (TanStack Query). Не класть ответы API в zustand — там только корзина/избранное.
// Контракт ручек: front/BACKEND.md
//
// Файл домена = ключи + queryFn + queryOptions + хуки. Ключи:
//   ['marks'] / ['marks','list'] / ['marks','detail', id]  (то же для models, categories, spare-parts, auth)
// Мутации: update/delete/фото — optimistic + rollback; create — invalidate lists.
// UI-состояния запроса: getQueryViewStatus + getQueryFlags, в разметке — <QueryStatus> со скелетоном из query-skeletons.
// Мутации: <MutationBusy> + <SubmitButton> из mutation-ui.
export { ApiError, getApiErrorDetails, getApiErrorMessage } from './http'
export { getAccessToken, setAccessToken, useAccessToken } from './auth-token'
export { catalogQueryDefaults, queryClient } from './query-client'
export {
  getMutationViewStatus,
  getQueryFlags,
  getQueryViewStatus,
  type MutationViewStatus,
  type QueryViewStatus,
} from './status'
export {
  firstImageSrc,
  imageFilename,
  type Admin,
  type Category,
  type CategoryWriteInput,
  type LoginResponse,
  type Mark,
  type MarkWriteInput,
  type Model,
  type ModelWriteInput,
  type ModelsListFilters,
  type SparePart,
  type SparePartWriteInput,
  type SparePartsListFilters,
} from './types'

export {
  authKeys,
  authQueries,
  getMe,
  login,
  logout,
  useIsAdmin,
  useLoginMutation,
  useMeQuery,
} from './auth'
export {
  categoriesKeys,
  categoriesQueries,
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
  useCategoriesQuery,
  useCategoryQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from './categories'
export {
  createMark,
  deleteMark,
  deleteMarkImage,
  getMark,
  getMarks,
  marksKeys,
  marksQueries,
  updateMark,
  useCreateMarkMutation,
  useDeleteMarkImageMutation,
  useDeleteMarkMutation,
  useMarkQuery,
  useMarksQuery,
  useUpdateMarkMutation,
} from './marks'
export {
  createModel,
  deleteModel,
  deleteModelImage,
  getModel,
  getModels,
  modelsKeys,
  modelsQueries,
  updateModel,
  useCreateModelMutation,
  useDeleteModelImageMutation,
  useDeleteModelMutation,
  useModelQuery,
  useModelsQuery,
  useUpdateModelMutation,
} from './models'
export {
  createSparePart,
  deleteSparePart,
  deleteSparePartImage,
  getSparePart,
  getSpareParts,
  sparePartsKeys,
  sparePartsQueries,
  updateSparePart,
  useCreateSparePartMutation,
  useDeleteSparePartImageMutation,
  useDeleteSparePartMutation,
  useSparePartQuery,
  useSparePartsQuery,
  useUpdateSparePartMutation,
} from './spare-parts'
