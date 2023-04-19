// rustc --target wasm32-wasi filetest.rs

use std::fs::File;
use std::io::prelude::*;

fn main() {
    let mut file = match File::open("README.md") {
        Err(why) => panic!("couldn't open: {}", why),
        Ok(file) => file,
    };

    // Read the file contents into a string, returns `io::Result<usize>`
    let mut s = String::new();
    match file.read_to_string(&mut s) {
        Err(why) => panic!("couldn't read: {}", why),
        Ok(size) => print!("size={}, content={}", size, s),
    }
}
