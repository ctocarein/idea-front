/** Feature IAM (profil porteur) — édition du profil + RGPD. Barrel. */
export { ProfileEditClient, type UserProfile } from "./ProfileEditClient";
export { updateProfile, type ProfileFormData } from "./profileActions";
export { AccountDangerZone } from "./AccountDangerZone";
export { deleteMyAccount } from "./gdprActions";
