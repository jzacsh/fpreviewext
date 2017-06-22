OUT_NAME  :=  extension
CRX_FILE  :=  $(OUT_NAME).crx
ZIP_FILE  :=  $(OUT_NAME).zip
SRC_DIR   :=  src
BIN_DIR   :=  bin
BUILDDIR  :=  build
EXT_DIR   :=  $(BUILDDIR)/$(OUT_NAME)
TYPESCPS  :=  $(wildcard $(SRC_DIR)/ts/*.ts)
TS_SPECS  :=  $(wildcard $(SRC_DIR)/ts/*.spec.ts)
BUILT_JS  :=  $(BUILDDIR)/js
JAVASCPS  :=  $(BUILT_JS)/index.js
PACKEDJS  :=  $(BUILDDIR)/bundle.js

# requires of buildcrx in $PATH; see:
#   https://github.com/jzacsh/bin/blob/65a3a4ee7902/share/buildcrx
$(CRX_FILE) $(ZIP_FILE): $(SRC_DIR)/manifest.json $(PACKEDJS) $(SRC_DIR)/index.css $(BUILDDIR)/icon.png
	$(shell mkdir -p $(EXT_DIR))
	$(shell $(BIN_DIR)/cptag $(EXT_DIR) $^)
	cd $(BUILDDIR) && ../$(BIN_DIR)/buildcrx $(OUT_NAME) $(PRIVATEK)
	ln --symbolic --force $(BUILDDIR)/$(CRX_FILE) $(CRX_FILE)

$(PACKEDJS): $(JAVASCPS)
	$(BIN_DIR)/webpack --config webpack.config.js

$(JAVASCPS): $(TYPESCPS)
	$(BIN_DIR)/tsc --outDir $(BUILT_JS)

$(BUILDDIR)/icon.png: $(SRC_DIR)/icon.svg
	mogrify -resize 128x128 -background none -format png $<
	mv $(SRC_DIR)/icon.png $@
# why the F*#j is imagemagick's output path option so complicated?

$(BUILDDIR):
	$(shell mkdir -p $@)

test: all $(JAVASCPS) $(TS_SPECS)
	$(BIN_DIR)/karma start karma.conf.js --single-run

tdd: $(JAVASCPS) $(TS_SPECS)
	$(BIN_DIR)/karma start

all: clean $(CRX_FILE)

clean:
	$(RM) -rf $(OUT_NAME).* $(BUILDDIR)

.PHONY: clean all tdd test
