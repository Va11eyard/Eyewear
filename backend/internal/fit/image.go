package fit

func ValidateImage(data []byte) error {
	if len(data) == 0 {
		return ErrInvalidImage
	}
	if len(data) > MaxImageBytes {
		return ErrImageTooLarge
	}
	if isJPEG(data) || isPNG(data) {
		return nil
	}
	return ErrInvalidImage
}

func isJPEG(data []byte) bool {
	return len(data) >= 3 && data[0] == 0xff && data[1] == 0xd8 && data[2] == 0xff
}

func isPNG(data []byte) bool {
	return len(data) >= 8 &&
		data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4e && data[3] == 0x47 &&
		data[4] == 0x0d && data[5] == 0x0a && data[6] == 0x1a && data[7] == 0x0a
}
