export const USER_PROFILE_UPDATED_EVENT = 'app:user-profile-updated'

export type UserProfileUpdatedDetail = {
  id: string
  name: string
  email: string
  image: string | null
  twoFactorEnabled: boolean
}

export const dispatchUserProfileUpdated = (
  detail: UserProfileUpdatedDetail
) => {
  window.dispatchEvent(
    new CustomEvent<UserProfileUpdatedDetail>(USER_PROFILE_UPDATED_EVENT, {
      detail,
    })
  )
}
