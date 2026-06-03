/**
 * Helper to translate backend and validation error messages to the currently active language.
 */
export function translateError(errorMsg: string | undefined | null, t: any): string {
    if (!errorMsg) return t('errors.networkError');
    
    const msg = errorMsg.trim();
    if (
        msg.includes('Không tìm thấy lộ trình xe buýt phù hợp') || 
        msg.includes('Không tìm thấy lộ trình phù hợp') || 
        msg.includes('no bus connections')
    ) {
        return t('errors.noRouteFound');
    }
    if (
        msg.includes('Vui lòng cung cấp điểm đi') || 
        msg.includes('Vui lòng cung cấp toạ độ') || 
        msg.includes('At least 2 coordinates') ||
        msg.includes('invalid') ||
        msg.includes('hợp lệ')
    ) {
        return t('errors.invalidCoords');
    }
    if (msg.includes('Không thể xác định trạm xuất phát')) {
        return t('errors.noOriginStop');
    }
    if (msg.includes('Yêu cầu đăng nhập để lưu lịch sử')) {
        return t('errors.loginRequiredToSaveHistory');
    }
    if (msg.includes('Không thể tải thông tin')) {
        return t('errors.failedToLoadProfile');
    }
    if (msg.includes('File ảnh quá lớn') || msg.includes('3MB')) {
        return t('errors.avatarTooLarge');
    }
    if (msg.includes('Chỉ chấp nhận file ảnh') || msg.includes('file image')) {
        return t('errors.avatarInvalidType');
    }
    if (msg.includes('Không thể upload ảnh')) {
        return t('errors.avatarFailed');
    }
    if (msg.includes('Không thể xoá lộ trình') || msg.includes('remove favorite')) {
        return t('errors.failedToRemoveFavorite');
    }
    if (msg.includes('Không thể xoá lịch sử') || msg.includes('delete history')) {
        return t('errors.failedToDeleteHistory');
    }
    if (msg.includes('Bạn cần đăng nhập để lưu lộ trình')) {
        return t('errors.loginRequiredToSave');
    }
    if (msg.includes('Đã lưu lộ trình vào yêu thích')) {
        return t('errors.savedToFavorites');
    }
    if (msg.includes('Không thể lưu lộ trình')) {
        return t('errors.failedToSaveFavorite');
    }
    
    return errorMsg;
}
