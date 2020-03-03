PELICAN := pelican
INPUTDIR := content
OUTPUTDIR := output

html:
	$(PELICAN) -s pelicanconf.py $(INPUTDIR)

clean:
	$(RM) -r $(OUTPUTDIR)

publish:
	$(PELICAN) -s publishconf.py $(INPUTDIR)

upload: publish
	rsync -a -z -e ssh --delete $(OUTPUTDIR)/ $(KIVHIFT_RSYNC_LOC)

.PHONY: html publish upload clean
