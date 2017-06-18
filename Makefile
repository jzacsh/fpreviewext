OUT_NAME  :=  extension
CRX_FILE  :=  $(OUT_NAME).crx
ZIP_FILE  :=  $(OUT_NAME).zip
TMP_BASE  :=  build.

# requires of buildcrx in $PATH; see:
#   https://github.com/jzacsh/bin/blob/65a3a4ee7902/share/buildcrx
$(CRX_FILE): manifest.json index.js index.css
	$(eval TMP := $(shell mktemp --directory --tmpdir=. $(TMP_BASE)XXXXXX))
	$(shell mkdir $(TMP)/$(OUT_NAME)/)
	$(shell ./cptag.sh $(TMP)/$(OUT_NAME)/ $^)
	cd $(TMP) && buildcrx $(OUT_NAME) $(PRIVATEK)
	cd $(TMP) && zip $(ZIP_FILE) $(OUT_NAME)/*
	ln --symbolic --force $(TMP)/$(CRX_FILE) $(CRX_FILE)

all: clean $(CRX_FILE)

clean:
	$(RM) $(OUT_NAME).* $(TMP_BASE)* -rf

.PHONY: clean all
