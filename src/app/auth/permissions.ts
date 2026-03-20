export type PermissionSlug = string;

export function hasPermission(
  userPermission: PermissionSlug[] | null,
  required: PermissionSlug | PermissionSlug[],
) {
  if (!userPermission) return false;

  if (Array.isArray(required)) {
    return required.some((perm) => userPermission.includes(perm));
  }

  return userPermission.includes(required);
}
