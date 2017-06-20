OUT_NAME  :=  extension
CRX_FILE  :=  $(OUT_NAME).crx
ZIP_FILE  :=  $(OUT_NAME).zip
BUILDDIR  :=  build
TYPESCPS  :=  $(wildcard *.ts)
TYPES_OD  :=  $(BUILDDIR)/js
JAVASCPS  :=  $(TYPES_OD)/$(TYPESCPS:.ts=.js)
EXT_DIR   :=  $(BUILDDIR)/$(OUT_NAME)

# requires of buildcrx in $PATH; see:
#   https://github.com/jzacsh/bin/blob/65a3a4ee7902/share/buildcrx
$(CRX_FILE): manifest.json $(JAVASCPS) index.css $(BUILDDIR)/icon.png
	$(shell mkdir -p $(EXT_DIR))
	$(shell ./cptag.sh $(EXT_DIR) $^)
	cd $(BUILDDIR) && buildcrx $(OUT_NAME) $(PRIVATEK)
	ln --symbolic --force $(BUILDDIR)/$(CRX_FILE) $(CRX_FILE)

$(ZIP_FILE):
	cd $(BUILDDIR) && zip $(ZIP_FILE) $(OUT_NAME)/*

$(JAVASCPS): $(TYPESCPS)
	tsc --outDir $(TYPES_OD)

$(BUILDDIR)/icon.png: icon.svg
	mogrify -resize 128x128 -background none -format png $<
	mv icon.png $@
# why the F*#j is imagemagick's output path option so complicated?

$(BUILDDIR):
	$(shell mkdir -p $@)

all: clean $(CRX_FILE)

clean:
	$(RM) -rf $(OUT_NAME).* $(BUILDDIR)

.PHONY: clean all
