import { DocumentData, FirestoreError, QueryDocumentSnapshot, Timestamp } from '@/libs/firebase'

import { db } from '@/config/firebase'

import { Entity } from '@/models/_common_/entity'
import { AuthError, DBError } from '@/models/_common_/error'

type DocumentValueType<T extends Entity> = ChangeTypeOfKeys<
  Exclude<T, 'id'>,
  'createdAt' | 'updatedAt',
  Timestamp
>

export abstract class DBRepository<T extends Entity> {

  db = db

  protected docToObject(doc: QueryDocumentSnapshot<DocumentData>): T {
    const data = doc.data() as DocumentValueType<T>

    let newData = {} as T

    Object.keys(data).map((key) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = data[key] as unknown
      if (value instanceof Timestamp) newData = { ...newData, [key]: value.toDate() }
      else return (newData = { ...newData, [key]: value })
    })

    return {
      ...newData,
      id: doc.id,
    } as T
  }

  protected objectToDoc(
    obj: OptionalByKey<T, 'id' | 'createdAt' | 'updatedAt'>
  ): DocumentValueType<T> {

    const isUpdating = obj.createdAt && !obj.updatedAt

    const data = {
      ...obj,
      createdAt: obj.createdAt ? Timestamp.fromDate(obj.createdAt) : Timestamp.fromDate(new Date()),
      ...(isUpdating && { updatedAt: Timestamp.fromDate(new Date()) }),
    } as DocumentValueType<T>

    return data
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected getError = (error: Error | FirestoreError | any) => {
    switch (error.code as FirestoreError['code']) {
      case 'resource-exhausted':
        return new DBError(
          'Firestore 요청 한도에 도달했습니다.',
          error
        )
      case 'already-exists':
        return new DBError('만들려는 데이터가 이미 존재합니다.', error)
      case 'deadline-exceeded':
        return new DBError('작업이 완료되기 전에 상한 시간을 초과했습니다.', error)
      case 'internal':
        return new DBError('알 수 없는 내부 오류가 발생했습니다.', error)
      case 'permission-denied':
        console.error(error)
        return new DBError('페이지가 없거나 작업에 필요한 권한이 없습니다.', error)
      case 'unauthenticated':
        return new AuthError('인증 오류가 발생했습니다.', error)
      default:
        return new Error(error)
    }
  }
}