OUT_NAME  :=  extension
BUILDDIR  :=  build
SRC_DIR   :=  src
BIN_DIR   :=  bin
ZIP_FILE  :=  $(BUILDDIR)/$(OUT_NAME).zip
CRX_FILE  :=  $(BUILDDIR)/$(OUT_NAME).crx
EXT_DIR   :=  $(BUILDDIR)/$(OUT_NAME)
TYPESCPS  :=  $(wildcard $(SRC_DIR)/ts/*.ts)
TS_SPECS  :=  $(wildcard $(SRC_DIR)/ts/*.spec.ts)
BUILT_JS  :=  $(BUILDDIR)/js
JAVASCPS  :=  $(BUILT_JS)/index.js
PACKEDJS  :=  $(BUILDDIR)/bundle.js

$(ZIP_FILE): $(SRC_DIR)/manifest.json $(PACKEDJS) $(SRC_DIR)/index.css $(BUILDDIR)/icon.png
	$(shell mkdir -p $(EXT_DIR))
	$(shell $(BIN_DIR)/cptag $(EXT_DIR) $^)
	cd $(BUILDDIR) && ../$(BIN_DIR)/buildcrx $(OUT_NAME)

# requires of buildcrx in $PATH; see:
#   https://github.com/jzacsh/bin/blob/65a3a4ee7902/share/buildcrx
$(CRX_FILE): $(ZIP_FILE)
	cd $(BUILDDIR) && ../$(BIN_DIR)/buildcrx $(OUT_NAME) $(PRIVATEK)

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
	$(MAKE) coverage

tdd: $(JAVASCPS) $(TS_SPECS)
	$(BIN_DIR)/karma start

coverage: SHELL:=/bin/bash
coverage:
	w3m -dump -T text/html < $(BUILDDIR)/coverage/*/lcov-report/index.html

all: clean $(ZIP_FILE)

clean:
	$(RM) -rf $(OUT_NAME).* $(BUILDDIR)

.PHONY: clean all tdd test coverage
