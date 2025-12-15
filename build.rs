use std::collections::HashMap;

fn main() {
    let config = slint_build::CompilerConfiguration::new()
        .with_style("cosmic-dark".to_string())
        .with_library_paths(HashMap::from([(
            "material".to_string(),
            std::path::Path::new(&std::env::var_os("CARGO_MANIFEST_DIR").unwrap())
                .join("./material.slint"),
        )]));
    slint_build::compile_with_config("ui/app-window.slint", config.clone())
        .expect("Slint build failed!");
}
