# Monkey patch to fix kconv issue in Ruby 3.4
# This fixes the "cannot load such file -- kconv" error

begin
  require 'kconv'
rescue LoadError
  module Kconv
    def self.toutf8(str)
      return str unless str.respond_to?(:force_encoding)
      str.dup.force_encoding('UTF-8')
    end

    def self.kconv(str, *args)
      str
    end

    # Define constants that might be used
    UTF8 = 'UTF-8'
    SJIS = 'Shift_JIS'
    EUC = 'EUC-JP'
    ASCII = 'ASCII'
    BINARY = 'BINARY'
    NOCONV = 0
    AUTO = 1
  end
end
