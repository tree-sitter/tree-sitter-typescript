all install uninstall clean:
	$(MAKE) -C typescript $@
	$(MAKE) -C tsx $@

.PHONY: all install uninstall clean
