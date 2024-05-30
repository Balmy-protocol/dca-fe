export const MuiCssBaseline = {
  styleOverrides: `
    /* vanilla-extract-css-ns:src/css/reset.css.ts.vanilla.css?source=Lmlla2JjYzAgewogIGJvcmRlcjogMDsKICBib3gtc2l6aW5nOiBib3JkZXItYm94OwogIGZvbnQtc2l6ZTogMTAwJTsKICBsaW5lLWhlaWdodDogbm9ybWFsOwogIG1hcmdpbjogMDsKICBwYWRkaW5nOiAwOwogIHRleHQtYWxpZ246IGxlZnQ7CiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lOwogIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7Cn0KLmlla2JjYzEgewogIGxpc3Qtc3R5bGU6IG5vbmU7Cn0KLmlla2JjYzIgewogIHF1b3Rlczogbm9uZTsKfQouaWVrYmNjMjpiZWZvcmUsIC5pZWtiY2MyOmFmdGVyIHsKICBjb250ZW50OiAnJzsKfQouaWVrYmNjMyB7CiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsKICBib3JkZXItc3BhY2luZzogMDsKfQouaWVrYmNjNCB7CiAgYXBwZWFyYW5jZTogbm9uZTsKfQouaWVrYmNjNSB7CiAgb3V0bGluZTogbm9uZTsKfQouaWVrYmNjNTo6cGxhY2Vob2xkZXIgewogIG9wYWNpdHk6IDE7Cn0KLmlla2JjYzYgewogIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OwogIGNvbG9yOiBpbmhlcml0Owp9Ci5pZWtiY2M3OmRpc2FibGVkIHsKICBvcGFjaXR5OiAxOwp9Ci5pZWtiY2M3OjotbXMtZXhwYW5kIHsKICBkaXNwbGF5OiBub25lOwp9Ci5pZWtiY2M4OjotbXMtY2xlYXIgewogIGRpc3BsYXk6IG5vbmU7Cn0KLmlla2JjYzg6Oi13ZWJraXQtc2VhcmNoLWNhbmNlbC1idXR0b24gewogIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTsKfQouaWVrYmNjOSB7CiAgYmFja2dyb3VuZDogbm9uZTsKICBjdXJzb3I6IHBvaW50ZXI7CiAgdGV4dC1hbGlnbjogbGVmdDsKfQouaWVrYmNjYSB7CiAgY29sb3I6IGluaGVyaXQ7CiAgdGV4dC1kZWNvcmF0aW9uOiBub25lOwp9 */
    [data-rk] .iekbcc0 {
      border: 0;
      box-sizing: border-box;
      font-size: 100%;
      line-height: normal;
      margin: 0;
      padding: 0;
      text-align: left;
      vertical-align: baseline;
      -webkit-tap-highlight-color: transparent;
    }
    [data-rk] .iekbcc1 {
      list-style: none;
    }
    [data-rk] .iekbcc2 {
      quotes: none;
    }
    [data-rk] .iekbcc2:before,
    [data-rk] .iekbcc2:after {
      content: "";
    }
    [data-rk] .iekbcc3 {
      border-collapse: collapse;
      border-spacing: 0;
    }
    [data-rk] .iekbcc4 {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
    [data-rk] .iekbcc5 {
      outline: none;
    }
    [data-rk] .iekbcc5::-moz-placeholder {
      opacity: 1;
    }
    [data-rk] .iekbcc5::placeholder {
      opacity: 1;
    }
    [data-rk] .iekbcc6 {
      background-color: transparent;
      color: inherit;
    }
    [data-rk] .iekbcc7:disabled {
      opacity: 1;
    }
    [data-rk] .iekbcc7::-ms-expand {
      display: none;
    }
    [data-rk] .iekbcc8::-ms-clear {
      display: none;
    }
    [data-rk] .iekbcc8::-webkit-search-cancel-button {
      -webkit-appearance: none;
    }
    [data-rk] .iekbcc9 {
      background: none;
      cursor: pointer;
      text-align: left;
    }
    [data-rk] .iekbcca {
      color: inherit;
      text-decoration: none;
    }

    /* vanilla-extract-css-ns:src/css/sprinkles.css.ts.vanilla.css?source=#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 */
    [data-rk] .ju367v0 {
      align-items: flex-start;
    }
    [data-rk] .ju367v2 {
      align-items: flex-end;
    }
    [data-rk] .ju367v4 {
      align-items: center;
    }
    [data-rk] .ju367v6 {
      display: none;
    }
    [data-rk] .ju367v8 {
      display: block;
    }
    [data-rk] .ju367va {
      display: flex;
    }
    [data-rk] .ju367vc {
      display: inline;
    }
    [data-rk] .ju367ve {
      align-self: flex-start;
    }
    [data-rk] .ju367vf {
      align-self: flex-end;
    }
    [data-rk] .ju367vg {
      align-self: center;
    }
    [data-rk] .ju367vh {
      background-size: cover;
    }
    [data-rk] .ju367vi {
      border-radius: 1px;
    }
    [data-rk] .ju367vj {
      border-radius: 6px;
    }
    [data-rk] .ju367vk {
      border-radius: 10px;
    }
    [data-rk] .ju367vl {
      border-radius: 13px;
    }
    [data-rk] .ju367vm {
      border-radius: var(--rk-radii-actionButton);
    }
    [data-rk] .ju367vn {
      border-radius: var(--rk-radii-connectButton);
    }
    [data-rk] .ju367vo {
      border-radius: var(--rk-radii-menuButton);
    }
    [data-rk] .ju367vp {
      border-radius: var(--rk-radii-modal);
    }
    [data-rk] .ju367vq {
      border-radius: var(--rk-radii-modalMobile);
    }
    [data-rk] .ju367vr {
      border-radius: 25%;
    }
    [data-rk] .ju367vs {
      border-radius: 9999px;
    }
    [data-rk] .ju367vt {
      border-style: solid;
    }
    [data-rk] .ju367vu {
      border-width: 0px;
    }
    [data-rk] .ju367vv {
      border-width: 1px;
    }
    [data-rk] .ju367vw {
      border-width: 2px;
    }
    [data-rk] .ju367vx {
      border-width: 4px;
    }
    [data-rk] .ju367vy {
      cursor: pointer;
    }
    [data-rk] .ju367vz {
      cursor: none;
    }
    [data-rk] .ju367v10 {
      pointer-events: none;
    }
    [data-rk] .ju367v11 {
      pointer-events: all;
    }
    [data-rk] .ju367v12 {
      min-height: 8px;
    }
    [data-rk] .ju367v13 {
      min-height: 44px;
    }
    [data-rk] .ju367v14 {
      flex-direction: row;
    }
    [data-rk] .ju367v15 {
      flex-direction: column;
    }
    [data-rk] .ju367v16 {
      font-family: var(--rk-fonts-body);
    }
    [data-rk] .ju367v17 {
      font-size: 12px;
      line-height: 18px;
    }
    [data-rk] .ju367v18 {
      font-size: 13px;
      line-height: 18px;
    }
    [data-rk] .ju367v19 {
      font-size: 14px;
      line-height: 18px;
    }
    [data-rk] .ju367v1a {
      font-size: 16px;
      line-height: 20px;
    }
    [data-rk] .ju367v1b {
      font-size: 18px;
      line-height: 24px;
    }
    [data-rk] .ju367v1c {
      font-size: 20px;
      line-height: 24px;
    }
    [data-rk] .ju367v1d {
      font-size: 23px;
      line-height: 29px;
    }
    [data-rk] .ju367v1e {
      font-weight: 400;
    }
    [data-rk] .ju367v1f {
      font-weight: 500;
    }
    [data-rk] .ju367v1g {
      font-weight: 600;
    }
    [data-rk] .ju367v1h {
      font-weight: 700;
    }
    [data-rk] .ju367v1i {
      font-weight: 800;
    }
    [data-rk] .ju367v1j {
      gap: 0;
    }
    [data-rk] .ju367v1k {
      gap: 1px;
    }
    [data-rk] .ju367v1l {
      gap: 2px;
    }
    [data-rk] .ju367v1m {
      gap: 3px;
    }
    [data-rk] .ju367v1n {
      gap: 4px;
    }
    [data-rk] .ju367v1o {
      gap: 5px;
    }
    [data-rk] .ju367v1p {
      gap: 6px;
    }
    [data-rk] .ju367v1q {
      gap: 8px;
    }
    [data-rk] .ju367v1r {
      gap: 10px;
    }
    [data-rk] .ju367v1s {
      gap: 12px;
    }
    [data-rk] .ju367v1t {
      gap: 14px;
    }
    [data-rk] .ju367v1u {
      gap: 16px;
    }
    [data-rk] .ju367v1v {
      gap: 18px;
    }
    [data-rk] .ju367v1w {
      gap: 20px;
    }
    [data-rk] .ju367v1x {
      gap: 24px;
    }
    [data-rk] .ju367v1y {
      gap: 28px;
    }
    [data-rk] .ju367v1z {
      gap: 32px;
    }
    [data-rk] .ju367v20 {
      gap: 36px;
    }
    [data-rk] .ju367v21 {
      gap: 44px;
    }
    [data-rk] .ju367v22 {
      gap: 64px;
    }
    [data-rk] .ju367v23 {
      gap: -1px;
    }
    [data-rk] .ju367v24 {
      height: 1px;
    }
    [data-rk] .ju367v25 {
      height: 2px;
    }
    [data-rk] .ju367v26 {
      height: 4px;
    }
    [data-rk] .ju367v27 {
      height: 8px;
    }
    [data-rk] .ju367v28 {
      height: 12px;
    }
    [data-rk] .ju367v29 {
      height: 20px;
    }
    [data-rk] .ju367v2a {
      height: 24px;
    }
    [data-rk] .ju367v2b {
      height: 28px;
    }
    [data-rk] .ju367v2c {
      height: 30px;
    }
    [data-rk] .ju367v2d {
      height: 32px;
    }
    [data-rk] .ju367v2e {
      height: 34px;
    }
    [data-rk] .ju367v2f {
      height: 36px;
    }
    [data-rk] .ju367v2g {
      height: 40px;
    }
    [data-rk] .ju367v2h {
      height: 44px;
    }
    [data-rk] .ju367v2i {
      height: 48px;
    }
    [data-rk] .ju367v2j {
      height: 54px;
    }
    [data-rk] .ju367v2k {
      height: 60px;
    }
    [data-rk] .ju367v2l {
      height: 200px;
    }
    [data-rk] .ju367v2m {
      height: 100%;
    }
    [data-rk] .ju367v2n {
      height: -moz-max-content;
      height: max-content;
    }
    [data-rk] .ju367v2o {
      justify-content: flex-start;
    }
    [data-rk] .ju367v2p {
      justify-content: flex-end;
    }
    [data-rk] .ju367v2q {
      justify-content: center;
    }
    [data-rk] .ju367v2r {
      justify-content: space-between;
    }
    [data-rk] .ju367v2s {
      justify-content: space-around;
    }
    [data-rk] .ju367v2t {
      text-align: left;
    }
    [data-rk] .ju367v2u {
      text-align: center;
    }
    [data-rk] .ju367v2v {
      text-align: inherit;
    }
    [data-rk] .ju367v2w {
      margin-bottom: 0;
    }
    [data-rk] .ju367v2x {
      margin-bottom: 1px;
    }
    [data-rk] .ju367v2y {
      margin-bottom: 2px;
    }
    [data-rk] .ju367v2z {
      margin-bottom: 3px;
    }
    [data-rk] .ju367v30 {
      margin-bottom: 4px;
    }
    [data-rk] .ju367v31 {
      margin-bottom: 5px;
    }
    [data-rk] .ju367v32 {
      margin-bottom: 6px;
    }
    [data-rk] .ju367v33 {
      margin-bottom: 8px;
    }
    [data-rk] .ju367v34 {
      margin-bottom: 10px;
    }
    [data-rk] .ju367v35 {
      margin-bottom: 12px;
    }
    [data-rk] .ju367v36 {
      margin-bottom: 14px;
    }
    [data-rk] .ju367v37 {
      margin-bottom: 16px;
    }
    [data-rk] .ju367v38 {
      margin-bottom: 18px;
    }
    [data-rk] .ju367v39 {
      margin-bottom: 20px;
    }
    [data-rk] .ju367v3a {
      margin-bottom: 24px;
    }
    [data-rk] .ju367v3b {
      margin-bottom: 28px;
    }
    [data-rk] .ju367v3c {
      margin-bottom: 32px;
    }
    [data-rk] .ju367v3d {
      margin-bottom: 36px;
    }
    [data-rk] .ju367v3e {
      margin-bottom: 44px;
    }
    [data-rk] .ju367v3f {
      margin-bottom: 64px;
    }
    [data-rk] .ju367v3g {
      margin-bottom: -1px;
    }
    [data-rk] .ju367v3h {
      margin-left: 0;
    }
    [data-rk] .ju367v3i {
      margin-left: 1px;
    }
    [data-rk] .ju367v3j {
      margin-left: 2px;
    }
    [data-rk] .ju367v3k {
      margin-left: 3px;
    }
    [data-rk] .ju367v3l {
      margin-left: 4px;
    }
    [data-rk] .ju367v3m {
      margin-left: 5px;
    }
    [data-rk] .ju367v3n {
      margin-left: 6px;
    }
    [data-rk] .ju367v3o {
      margin-left: 8px;
    }
    [data-rk] .ju367v3p {
      margin-left: 10px;
    }
    [data-rk] .ju367v3q {
      margin-left: 12px;
    }
    [data-rk] .ju367v3r {
      margin-left: 14px;
    }
    [data-rk] .ju367v3s {
      margin-left: 16px;
    }
    [data-rk] .ju367v3t {
      margin-left: 18px;
    }
    [data-rk] .ju367v3u {
      margin-left: 20px;
    }
    [data-rk] .ju367v3v {
      margin-left: 24px;
    }
    [data-rk] .ju367v3w {
      margin-left: 28px;
    }
    [data-rk] .ju367v3x {
      margin-left: 32px;
    }
    [data-rk] .ju367v3y {
      margin-left: 36px;
    }
    [data-rk] .ju367v3z {
      margin-left: 44px;
    }
    [data-rk] .ju367v40 {
      margin-left: 64px;
    }
    [data-rk] .ju367v41 {
      margin-left: -1px;
    }
    [data-rk] .ju367v42 {
      margin-right: 0;
    }
    [data-rk] .ju367v43 {
      margin-right: 1px;
    }
    [data-rk] .ju367v44 {
      margin-right: 2px;
    }
    [data-rk] .ju367v45 {
      margin-right: 3px;
    }
    [data-rk] .ju367v46 {
      margin-right: 4px;
    }
    [data-rk] .ju367v47 {
      margin-right: 5px;
    }
    [data-rk] .ju367v48 {
      margin-right: 6px;
    }
    [data-rk] .ju367v49 {
      margin-right: 8px;
    }
    [data-rk] .ju367v4a {
      margin-right: 10px;
    }
    [data-rk] .ju367v4b {
      margin-right: 12px;
    }
    [data-rk] .ju367v4c {
      margin-right: 14px;
    }
    [data-rk] .ju367v4d {
      margin-right: 16px;
    }
    [data-rk] .ju367v4e {
      margin-right: 18px;
    }
    [data-rk] .ju367v4f {
      margin-right: 20px;
    }
    [data-rk] .ju367v4g {
      margin-right: 24px;
    }
    [data-rk] .ju367v4h {
      margin-right: 28px;
    }
    [data-rk] .ju367v4i {
      margin-right: 32px;
    }
    [data-rk] .ju367v4j {
      margin-right: 36px;
    }
    [data-rk] .ju367v4k {
      margin-right: 44px;
    }
    [data-rk] .ju367v4l {
      margin-right: 64px;
    }
    [data-rk] .ju367v4m {
      margin-right: -1px;
    }
    [data-rk] .ju367v4n {
      margin-top: 0;
    }
    [data-rk] .ju367v4o {
      margin-top: 1px;
    }
    [data-rk] .ju367v4p {
      margin-top: 2px;
    }
    [data-rk] .ju367v4q {
      margin-top: 3px;
    }
    [data-rk] .ju367v4r {
      margin-top: 4px;
    }
    [data-rk] .ju367v4s {
      margin-top: 5px;
    }
    [data-rk] .ju367v4t {
      margin-top: 6px;
    }
    [data-rk] .ju367v4u {
      margin-top: 8px;
    }
    [data-rk] .ju367v4v {
      margin-top: 10px;
    }
    [data-rk] .ju367v4w {
      margin-top: 12px;
    }
    [data-rk] .ju367v4x {
      margin-top: 14px;
    }
    [data-rk] .ju367v4y {
      margin-top: 16px;
    }
    [data-rk] .ju367v4z {
      margin-top: 18px;
    }
    [data-rk] .ju367v50 {
      margin-top: 20px;
    }
    [data-rk] .ju367v51 {
      margin-top: 24px;
    }
    [data-rk] .ju367v52 {
      margin-top: 28px;
    }
    [data-rk] .ju367v53 {
      margin-top: 32px;
    }
    [data-rk] .ju367v54 {
      margin-top: 36px;
    }
    [data-rk] .ju367v55 {
      margin-top: 44px;
    }
    [data-rk] .ju367v56 {
      margin-top: 64px;
    }
    [data-rk] .ju367v57 {
      margin-top: -1px;
    }
    [data-rk] .ju367v58 {
      max-width: 1px;
    }
    [data-rk] .ju367v59 {
      max-width: 2px;
    }
    [data-rk] .ju367v5a {
      max-width: 4px;
    }
    [data-rk] .ju367v5b {
      max-width: 8px;
    }
    [data-rk] .ju367v5c {
      max-width: 12px;
    }
    [data-rk] .ju367v5d {
      max-width: 20px;
    }
    [data-rk] .ju367v5e {
      max-width: 24px;
    }
    [data-rk] .ju367v5f {
      max-width: 28px;
    }
    [data-rk] .ju367v5g {
      max-width: 30px;
    }
    [data-rk] .ju367v5h {
      max-width: 32px;
    }
    [data-rk] .ju367v5i {
      max-width: 34px;
    }
    [data-rk] .ju367v5j {
      max-width: 36px;
    }
    [data-rk] .ju367v5k {
      max-width: 40px;
    }
    [data-rk] .ju367v5l {
      max-width: 44px;
    }
    [data-rk] .ju367v5m {
      max-width: 48px;
    }
    [data-rk] .ju367v5n {
      max-width: 54px;
    }
    [data-rk] .ju367v5o {
      max-width: 60px;
    }
    [data-rk] .ju367v5p {
      max-width: 200px;
    }
    [data-rk] .ju367v5q {
      max-width: 100%;
    }
    [data-rk] .ju367v5r {
      max-width: -moz-max-content;
      max-width: max-content;
    }
    [data-rk] .ju367v5s {
      min-width: 1px;
    }
    [data-rk] .ju367v5t {
      min-width: 2px;
    }
    [data-rk] .ju367v5u {
      min-width: 4px;
    }
    [data-rk] .ju367v5v {
      min-width: 8px;
    }
    [data-rk] .ju367v5w {
      min-width: 12px;
    }
    [data-rk] .ju367v5x {
      min-width: 20px;
    }
    [data-rk] .ju367v5y {
      min-width: 24px;
    }
    [data-rk] .ju367v5z {
      min-width: 28px;
    }
    [data-rk] .ju367v60 {
      min-width: 30px;
    }
    [data-rk] .ju367v61 {
      min-width: 32px;
    }
    [data-rk] .ju367v62 {
      min-width: 34px;
    }
    [data-rk] .ju367v63 {
      min-width: 36px;
    }
    [data-rk] .ju367v64 {
      min-width: 40px;
    }
    [data-rk] .ju367v65 {
      min-width: 44px;
    }
    [data-rk] .ju367v66 {
      min-width: 48px;
    }
    [data-rk] .ju367v67 {
      min-width: 54px;
    }
    [data-rk] .ju367v68 {
      min-width: 60px;
    }
    [data-rk] .ju367v69 {
      min-width: 200px;
    }
    [data-rk] .ju367v6a {
      min-width: 100%;
    }
    [data-rk] .ju367v6b {
      min-width: -moz-max-content;
      min-width: max-content;
    }
    [data-rk] .ju367v6c {
      overflow: hidden;
    }
    [data-rk] .ju367v6d {
      padding-bottom: 0;
    }
    [data-rk] .ju367v6e {
      padding-bottom: 1px;
    }
    [data-rk] .ju367v6f {
      padding-bottom: 2px;
    }
    [data-rk] .ju367v6g {
      padding-bottom: 3px;
    }
    [data-rk] .ju367v6h {
      padding-bottom: 4px;
    }
    [data-rk] .ju367v6i {
      padding-bottom: 5px;
    }
    [data-rk] .ju367v6j {
      padding-bottom: 6px;
    }
    [data-rk] .ju367v6k {
      padding-bottom: 8px;
    }
    [data-rk] .ju367v6l {
      padding-bottom: 10px;
    }
    [data-rk] .ju367v6m {
      padding-bottom: 12px;
    }
    [data-rk] .ju367v6n {
      padding-bottom: 14px;
    }
    [data-rk] .ju367v6o {
      padding-bottom: 16px;
    }
    [data-rk] .ju367v6p {
      padding-bottom: 18px;
    }
    [data-rk] .ju367v6q {
      padding-bottom: 20px;
    }
    [data-rk] .ju367v6r {
      padding-bottom: 24px;
    }
    [data-rk] .ju367v6s {
      padding-bottom: 28px;
    }
    [data-rk] .ju367v6t {
      padding-bottom: 32px;
    }
    [data-rk] .ju367v6u {
      padding-bottom: 36px;
    }
    [data-rk] .ju367v6v {
      padding-bottom: 44px;
    }
    [data-rk] .ju367v6w {
      padding-bottom: 64px;
    }
    [data-rk] .ju367v6x {
      padding-bottom: -1px;
    }
    [data-rk] .ju367v6y {
      padding-left: 0;
    }
    [data-rk] .ju367v6z {
      padding-left: 1px;
    }
    [data-rk] .ju367v70 {
      padding-left: 2px;
    }
    [data-rk] .ju367v71 {
      padding-left: 3px;
    }
    [data-rk] .ju367v72 {
      padding-left: 4px;
    }
    [data-rk] .ju367v73 {
      padding-left: 5px;
    }
    [data-rk] .ju367v74 {
      padding-left: 6px;
    }
    [data-rk] .ju367v75 {
      padding-left: 8px;
    }
    [data-rk] .ju367v76 {
      padding-left: 10px;
    }
    [data-rk] .ju367v77 {
      padding-left: 12px;
    }
    [data-rk] .ju367v78 {
      padding-left: 14px;
    }
    [data-rk] .ju367v79 {
      padding-left: 16px;
    }
    [data-rk] .ju367v7a {
      padding-left: 18px;
    }
    [data-rk] .ju367v7b {
      padding-left: 20px;
    }
    [data-rk] .ju367v7c {
      padding-left: 24px;
    }
    [data-rk] .ju367v7d {
      padding-left: 28px;
    }
    [data-rk] .ju367v7e {
      padding-left: 32px;
    }
    [data-rk] .ju367v7f {
      padding-left: 36px;
    }
    [data-rk] .ju367v7g {
      padding-left: 44px;
    }
    [data-rk] .ju367v7h {
      padding-left: 64px;
    }
    [data-rk] .ju367v7i {
      padding-left: -1px;
    }
    [data-rk] .ju367v7j {
      padding-right: 0;
    }
    [data-rk] .ju367v7k {
      padding-right: 1px;
    }
    [data-rk] .ju367v7l {
      padding-right: 2px;
    }
    [data-rk] .ju367v7m {
      padding-right: 3px;
    }
    [data-rk] .ju367v7n {
      padding-right: 4px;
    }
    [data-rk] .ju367v7o {
      padding-right: 5px;
    }
    [data-rk] .ju367v7p {
      padding-right: 6px;
    }
    [data-rk] .ju367v7q {
      padding-right: 8px;
    }
    [data-rk] .ju367v7r {
      padding-right: 10px;
    }
    [data-rk] .ju367v7s {
      padding-right: 12px;
    }
    [data-rk] .ju367v7t {
      padding-right: 14px;
    }
    [data-rk] .ju367v7u {
      padding-right: 16px;
    }
    [data-rk] .ju367v7v {
      padding-right: 18px;
    }
    [data-rk] .ju367v7w {
      padding-right: 20px;
    }
    [data-rk] .ju367v7x {
      padding-right: 24px;
    }
    [data-rk] .ju367v7y {
      padding-right: 28px;
    }
    [data-rk] .ju367v7z {
      padding-right: 32px;
    }
    [data-rk] .ju367v80 {
      padding-right: 36px;
    }
    [data-rk] .ju367v81 {
      padding-right: 44px;
    }
    [data-rk] .ju367v82 {
      padding-right: 64px;
    }
    [data-rk] .ju367v83 {
      padding-right: -1px;
    }
    [data-rk] .ju367v84 {
      padding-top: 0;
    }
    [data-rk] .ju367v85 {
      padding-top: 1px;
    }
    [data-rk] .ju367v86 {
      padding-top: 2px;
    }
    [data-rk] .ju367v87 {
      padding-top: 3px;
    }
    [data-rk] .ju367v88 {
      padding-top: 4px;
    }
    [data-rk] .ju367v89 {
      padding-top: 5px;
    }
    [data-rk] .ju367v8a {
      padding-top: 6px;
    }
    [data-rk] .ju367v8b {
      padding-top: 8px;
    }
    [data-rk] .ju367v8c {
      padding-top: 10px;
    }
    [data-rk] .ju367v8d {
      padding-top: 12px;
    }
    [data-rk] .ju367v8e {
      padding-top: 14px;
    }
    [data-rk] .ju367v8f {
      padding-top: 16px;
    }
    [data-rk] .ju367v8g {
      padding-top: 18px;
    }
    [data-rk] .ju367v8h {
      padding-top: 20px;
    }
    [data-rk] .ju367v8i {
      padding-top: 24px;
    }
    [data-rk] .ju367v8j {
      padding-top: 28px;
    }
    [data-rk] .ju367v8k {
      padding-top: 32px;
    }
    [data-rk] .ju367v8l {
      padding-top: 36px;
    }
    [data-rk] .ju367v8m {
      padding-top: 44px;
    }
    [data-rk] .ju367v8n {
      padding-top: 64px;
    }
    [data-rk] .ju367v8o {
      padding-top: -1px;
    }
    [data-rk] .ju367v8p {
      position: absolute;
    }
    [data-rk] .ju367v8q {
      position: fixed;
    }
    [data-rk] .ju367v8r {
      position: relative;
    }
    [data-rk] .ju367v8s {
      -webkit-user-select: none;
    }
    [data-rk] .ju367v8t {
      right: 0;
    }
    [data-rk] .ju367v8u {
      transition: 0.125s ease;
    }
    [data-rk] .ju367v8v {
      transition: transform 0.125s ease;
    }
    [data-rk] .ju367v8w {
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
    }
    [data-rk] .ju367v8x {
      width: 1px;
    }
    [data-rk] .ju367v8y {
      width: 2px;
    }
    [data-rk] .ju367v8z {
      width: 4px;
    }
    [data-rk] .ju367v90 {
      width: 8px;
    }
    [data-rk] .ju367v91 {
      width: 12px;
    }
    [data-rk] .ju367v92 {
      width: 20px;
    }
    [data-rk] .ju367v93 {
      width: 24px;
    }
    [data-rk] .ju367v94 {
      width: 28px;
    }
    [data-rk] .ju367v95 {
      width: 30px;
    }
    [data-rk] .ju367v96 {
      width: 32px;
    }
    [data-rk] .ju367v97 {
      width: 34px;
    }
    [data-rk] .ju367v98 {
      width: 36px;
    }
    [data-rk] .ju367v99 {
      width: 40px;
    }
    [data-rk] .ju367v9a {
      width: 44px;
    }
    [data-rk] .ju367v9b {
      width: 48px;
    }
    [data-rk] .ju367v9c {
      width: 54px;
    }
    [data-rk] .ju367v9d {
      width: 60px;
    }
    [data-rk] .ju367v9e {
      width: 200px;
    }
    [data-rk] .ju367v9f {
      width: 100%;
    }
    [data-rk] .ju367v9g {
      width: -moz-max-content;
      width: max-content;
    }
    [data-rk] .ju367v9h {
      -webkit-backdrop-filter: var(--rk-blurs-modalOverlay);
      backdrop-filter: var(--rk-blurs-modalOverlay);
    }
    [data-rk] .ju367v9i {
      background: var(--rk-colors-accentColor);
    }
    [data-rk] .ju367v9j:hover {
      background: var(--rk-colors-accentColor);
    }
    [data-rk] .ju367v9k:active {
      background: var(--rk-colors-accentColor);
    }
    [data-rk] .ju367v9l {
      background: var(--rk-colors-accentColorForeground);
    }
    [data-rk] .ju367v9m:hover {
      background: var(--rk-colors-accentColorForeground);
    }
    [data-rk] .ju367v9n:active {
      background: var(--rk-colors-accentColorForeground);
    }
    [data-rk] .ju367v9o {
      background: var(--rk-colors-actionButtonBorder);
    }
    [data-rk] .ju367v9p:hover {
      background: var(--rk-colors-actionButtonBorder);
    }
    [data-rk] .ju367v9q:active {
      background: var(--rk-colors-actionButtonBorder);
    }
    [data-rk] .ju367v9r {
      background: var(--rk-colors-actionButtonBorderMobile);
    }
    [data-rk] .ju367v9s:hover {
      background: var(--rk-colors-actionButtonBorderMobile);
    }
    [data-rk] .ju367v9t:active {
      background: var(--rk-colors-actionButtonBorderMobile);
    }
    [data-rk] .ju367v9u {
      background: var(--rk-colors-actionButtonSecondaryBackground);
    }
    [data-rk] .ju367v9v:hover {
      background: var(--rk-colors-actionButtonSecondaryBackground);
    }
    [data-rk] .ju367v9w:active {
      background: var(--rk-colors-actionButtonSecondaryBackground);
    }
    [data-rk] .ju367v9x {
      background: var(--rk-colors-closeButton);
    }
    [data-rk] .ju367v9y:hover {
      background: var(--rk-colors-closeButton);
    }
    [data-rk] .ju367v9z:active {
      background: var(--rk-colors-closeButton);
    }
    [data-rk] .ju367va0 {
      background: var(--rk-colors-closeButtonBackground);
    }
    [data-rk] .ju367va1:hover {
      background: var(--rk-colors-closeButtonBackground);
    }
    [data-rk] .ju367va2:active {
      background: var(--rk-colors-closeButtonBackground);
    }
    [data-rk] .ju367va3 {
      background: var(--rk-colors-connectButtonBackground);
    }
    [data-rk] .ju367va4:hover {
      background: var(--rk-colors-connectButtonBackground);
    }
    [data-rk] .ju367va5:active {
      background: var(--rk-colors-connectButtonBackground);
    }
    [data-rk] .ju367va6 {
      background: var(--rk-colors-connectButtonBackgroundError);
    }
    [data-rk] .ju367va7:hover {
      background: var(--rk-colors-connectButtonBackgroundError);
    }
    [data-rk] .ju367va8:active {
      background: var(--rk-colors-connectButtonBackgroundError);
    }
    [data-rk] .ju367va9 {
      background: var(--rk-colors-connectButtonInnerBackground);
    }
    [data-rk] .ju367vaa:hover {
      background: var(--rk-colors-connectButtonInnerBackground);
    }
    [data-rk] .ju367vab:active {
      background: var(--rk-colors-connectButtonInnerBackground);
    }
    [data-rk] .ju367vac {
      background: var(--rk-colors-connectButtonText);
    }
    [data-rk] .ju367vad:hover {
      background: var(--rk-colors-connectButtonText);
    }
    [data-rk] .ju367vae:active {
      background: var(--rk-colors-connectButtonText);
    }
    [data-rk] .ju367vaf {
      background: var(--rk-colors-connectButtonTextError);
    }
    [data-rk] .ju367vag:hover {
      background: var(--rk-colors-connectButtonTextError);
    }
    [data-rk] .ju367vah:active {
      background: var(--rk-colors-connectButtonTextError);
    }
    [data-rk] .ju367vai {
      background: var(--rk-colors-connectionIndicator);
    }
    [data-rk] .ju367vaj:hover {
      background: var(--rk-colors-connectionIndicator);
    }
    [data-rk] .ju367vak:active {
      background: var(--rk-colors-connectionIndicator);
    }
    [data-rk] .ju367val {
      background: var(--rk-colors-downloadBottomCardBackground);
    }
    [data-rk] .ju367vam:hover {
      background: var(--rk-colors-downloadBottomCardBackground);
    }
    [data-rk] .ju367van:active {
      background: var(--rk-colors-downloadBottomCardBackground);
    }
    [data-rk] .ju367vao {
      background: var(--rk-colors-downloadTopCardBackground);
    }
    [data-rk] .ju367vap:hover {
      background: var(--rk-colors-downloadTopCardBackground);
    }
    [data-rk] .ju367vaq:active {
      background: var(--rk-colors-downloadTopCardBackground);
    }
    [data-rk] .ju367var {
      background: var(--rk-colors-error);
    }
    [data-rk] .ju367vas:hover {
      background: var(--rk-colors-error);
    }
    [data-rk] .ju367vat:active {
      background: var(--rk-colors-error);
    }
    [data-rk] .ju367vau {
      background: var(--rk-colors-generalBorder);
    }
    [data-rk] .ju367vav:hover {
      background: var(--rk-colors-generalBorder);
    }
    [data-rk] .ju367vaw:active {
      background: var(--rk-colors-generalBorder);
    }
    [data-rk] .ju367vax {
      background: var(--rk-colors-generalBorderDim);
    }
    [data-rk] .ju367vay:hover {
      background: var(--rk-colors-generalBorderDim);
    }
    [data-rk] .ju367vaz:active {
      background: var(--rk-colors-generalBorderDim);
    }
    [data-rk] .ju367vb0 {
      background: var(--rk-colors-menuItemBackground);
    }
    [data-rk] .ju367vb1:hover {
      background: var(--rk-colors-menuItemBackground);
    }
    [data-rk] .ju367vb2:active {
      background: var(--rk-colors-menuItemBackground);
    }
    [data-rk] .ju367vb3 {
      background: var(--rk-colors-modalBackdrop);
    }
    [data-rk] .ju367vb4:hover {
      background: var(--rk-colors-modalBackdrop);
    }
    [data-rk] .ju367vb5:active {
      background: var(--rk-colors-modalBackdrop);
    }
    [data-rk] .ju367vb6 {
      background: var(--rk-colors-modalBackground);
    }
    [data-rk] .ju367vb7:hover {
      background: var(--rk-colors-modalBackground);
    }
    [data-rk] .ju367vb8:active {
      background: var(--rk-colors-modalBackground);
    }
    [data-rk] .ju367vb9 {
      background: var(--rk-colors-modalBorder);
    }
    [data-rk] .ju367vba:hover {
      background: var(--rk-colors-modalBorder);
    }
    [data-rk] .ju367vbb:active {
      background: var(--rk-colors-modalBorder);
    }
    [data-rk] .ju367vbc {
      background: var(--rk-colors-modalText);
    }
    [data-rk] .ju367vbd:hover {
      background: var(--rk-colors-modalText);
    }
    [data-rk] .ju367vbe:active {
      background: var(--rk-colors-modalText);
    }
    [data-rk] .ju367vbf {
      background: var(--rk-colors-modalTextDim);
    }
    [data-rk] .ju367vbg:hover {
      background: var(--rk-colors-modalTextDim);
    }
    [data-rk] .ju367vbh:active {
      background: var(--rk-colors-modalTextDim);
    }
    [data-rk] .ju367vbi {
      background: var(--rk-colors-modalTextSecondary);
    }
    [data-rk] .ju367vbj:hover {
      background: var(--rk-colors-modalTextSecondary);
    }
    [data-rk] .ju367vbk:active {
      background: var(--rk-colors-modalTextSecondary);
    }
    [data-rk] .ju367vbl {
      background: var(--rk-colors-profileAction);
    }
    [data-rk] .ju367vbm:hover {
      background: var(--rk-colors-profileAction);
    }
    [data-rk] .ju367vbn:active {
      background: var(--rk-colors-profileAction);
    }
    [data-rk] .ju367vbo {
      background: var(--rk-colors-profileActionHover);
    }
    [data-rk] .ju367vbp:hover {
      background: var(--rk-colors-profileActionHover);
    }
    [data-rk] .ju367vbq:active {
      background: var(--rk-colors-profileActionHover);
    }
    [data-rk] .ju367vbr {
      background: var(--rk-colors-profileForeground);
    }
    [data-rk] .ju367vbs:hover {
      background: var(--rk-colors-profileForeground);
    }
    [data-rk] .ju367vbt:active {
      background: var(--rk-colors-profileForeground);
    }
    [data-rk] .ju367vbu {
      background: var(--rk-colors-selectedOptionBorder);
    }
    [data-rk] .ju367vbv:hover {
      background: var(--rk-colors-selectedOptionBorder);
    }
    [data-rk] .ju367vbw:active {
      background: var(--rk-colors-selectedOptionBorder);
    }
    [data-rk] .ju367vbx {
      background: var(--rk-colors-standby);
    }
    [data-rk] .ju367vby:hover {
      background: var(--rk-colors-standby);
    }
    [data-rk] .ju367vbz:active {
      background: var(--rk-colors-standby);
    }
    [data-rk] .ju367vc0 {
      border-color: var(--rk-colors-accentColor);
    }
    [data-rk] .ju367vc1:hover {
      border-color: var(--rk-colors-accentColor);
    }
    [data-rk] .ju367vc2:active {
      border-color: var(--rk-colors-accentColor);
    }
    [data-rk] .ju367vc3 {
      border-color: var(--rk-colors-accentColorForeground);
    }
    [data-rk] .ju367vc4:hover {
      border-color: var(--rk-colors-accentColorForeground);
    }
    [data-rk] .ju367vc5:active {
      border-color: var(--rk-colors-accentColorForeground);
    }
    [data-rk] .ju367vc6 {
      border-color: var(--rk-colors-actionButtonBorder);
    }
    [data-rk] .ju367vc7:hover {
      border-color: var(--rk-colors-actionButtonBorder);
    }
    [data-rk] .ju367vc8:active {
      border-color: var(--rk-colors-actionButtonBorder);
    }
    [data-rk] .ju367vc9 {
      border-color: var(--rk-colors-actionButtonBorderMobile);
    }
    [data-rk] .ju367vca:hover {
      border-color: var(--rk-colors-actionButtonBorderMobile);
    }
    [data-rk] .ju367vcb:active {
      border-color: var(--rk-colors-actionButtonBorderMobile);
    }
    [data-rk] .ju367vcc {
      border-color: var(--rk-colors-actionButtonSecondaryBackground);
    }
    [data-rk] .ju367vcd:hover {
      border-color: var(--rk-colors-actionButtonSecondaryBackground);
    }
    [data-rk] .ju367vce:active {
      border-color: var(--rk-colors-actionButtonSecondaryBackground);
    }
    [data-rk] .ju367vcf {
      border-color: var(--rk-colors-closeButton);
    }
    [data-rk] .ju367vcg:hover {
      border-color: var(--rk-colors-closeButton);
    }
    [data-rk] .ju367vch:active {
      border-color: var(--rk-colors-closeButton);
    }
    [data-rk] .ju367vci {
      border-color: var(--rk-colors-closeButtonBackground);
    }
    [data-rk] .ju367vcj:hover {
      border-color: var(--rk-colors-closeButtonBackground);
    }
    [data-rk] .ju367vck:active {
      border-color: var(--rk-colors-closeButtonBackground);
    }
    [data-rk] .ju367vcl {
      border-color: var(--rk-colors-connectButtonBackground);
    }
    [data-rk] .ju367vcm:hover {
      border-color: var(--rk-colors-connectButtonBackground);
    }
    [data-rk] .ju367vcn:active {
      border-color: var(--rk-colors-connectButtonBackground);
    }
    [data-rk] .ju367vco {
      border-color: var(--rk-colors-connectButtonBackgroundError);
    }
    [data-rk] .ju367vcp:hover {
      border-color: var(--rk-colors-connectButtonBackgroundError);
    }
    [data-rk] .ju367vcq:active {
      border-color: var(--rk-colors-connectButtonBackgroundError);
    }
    [data-rk] .ju367vcr {
      border-color: var(--rk-colors-connectButtonInnerBackground);
    }
    [data-rk] .ju367vcs:hover {
      border-color: var(--rk-colors-connectButtonInnerBackground);
    }
    [data-rk] .ju367vct:active {
      border-color: var(--rk-colors-connectButtonInnerBackground);
    }
    [data-rk] .ju367vcu {
      border-color: var(--rk-colors-connectButtonText);
    }
    [data-rk] .ju367vcv:hover {
      border-color: var(--rk-colors-connectButtonText);
    }
    [data-rk] .ju367vcw:active {
      border-color: var(--rk-colors-connectButtonText);
    }
    [data-rk] .ju367vcx {
      border-color: var(--rk-colors-connectButtonTextError);
    }
    [data-rk] .ju367vcy:hover {
      border-color: var(--rk-colors-connectButtonTextError);
    }
    [data-rk] .ju367vcz:active {
      border-color: var(--rk-colors-connectButtonTextError);
    }
    [data-rk] .ju367vd0 {
      border-color: var(--rk-colors-connectionIndicator);
    }
    [data-rk] .ju367vd1:hover {
      border-color: var(--rk-colors-connectionIndicator);
    }
    [data-rk] .ju367vd2:active {
      border-color: var(--rk-colors-connectionIndicator);
    }
    [data-rk] .ju367vd3 {
      border-color: var(--rk-colors-downloadBottomCardBackground);
    }
    [data-rk] .ju367vd4:hover {
      border-color: var(--rk-colors-downloadBottomCardBackground);
    }
    [data-rk] .ju367vd5:active {
      border-color: var(--rk-colors-downloadBottomCardBackground);
    }
    [data-rk] .ju367vd6 {
      border-color: var(--rk-colors-downloadTopCardBackground);
    }
    [data-rk] .ju367vd7:hover {
      border-color: var(--rk-colors-downloadTopCardBackground);
    }
    [data-rk] .ju367vd8:active {
      border-color: var(--rk-colors-downloadTopCardBackground);
    }
    [data-rk] .ju367vd9 {
      border-color: var(--rk-colors-error);
    }
    [data-rk] .ju367vda:hover {
      border-color: var(--rk-colors-error);
    }
    [data-rk] .ju367vdb:active {
      border-color: var(--rk-colors-error);
    }
    [data-rk] .ju367vdc {
      border-color: var(--rk-colors-generalBorder);
    }
    [data-rk] .ju367vdd:hover {
      border-color: var(--rk-colors-generalBorder);
    }
    [data-rk] .ju367vde:active {
      border-color: var(--rk-colors-generalBorder);
    }
    [data-rk] .ju367vdf {
      border-color: var(--rk-colors-generalBorderDim);
    }
    [data-rk] .ju367vdg:hover {
      border-color: var(--rk-colors-generalBorderDim);
    }
    [data-rk] .ju367vdh:active {
      border-color: var(--rk-colors-generalBorderDim);
    }
    [data-rk] .ju367vdi {
      border-color: var(--rk-colors-menuItemBackground);
    }
    [data-rk] .ju367vdj:hover {
      border-color: var(--rk-colors-menuItemBackground);
    }
    [data-rk] .ju367vdk:active {
      border-color: var(--rk-colors-menuItemBackground);
    }
    [data-rk] .ju367vdl {
      border-color: var(--rk-colors-modalBackdrop);
    }
    [data-rk] .ju367vdm:hover {
      border-color: var(--rk-colors-modalBackdrop);
    }
    [data-rk] .ju367vdn:active {
      border-color: var(--rk-colors-modalBackdrop);
    }
    [data-rk] .ju367vdo {
      border-color: var(--rk-colors-modalBackground);
    }
    [data-rk] .ju367vdp:hover {
      border-color: var(--rk-colors-modalBackground);
    }
    [data-rk] .ju367vdq:active {
      border-color: var(--rk-colors-modalBackground);
    }
    [data-rk] .ju367vdr {
      border-color: var(--rk-colors-modalBorder);
    }
    [data-rk] .ju367vds:hover {
      border-color: var(--rk-colors-modalBorder);
    }
    [data-rk] .ju367vdt:active {
      border-color: var(--rk-colors-modalBorder);
    }
    [data-rk] .ju367vdu {
      border-color: var(--rk-colors-modalText);
    }
    [data-rk] .ju367vdv:hover {
      border-color: var(--rk-colors-modalText);
    }
    [data-rk] .ju367vdw:active {
      border-color: var(--rk-colors-modalText);
    }
    [data-rk] .ju367vdx {
      border-color: var(--rk-colors-modalTextDim);
    }
    [data-rk] .ju367vdy:hover {
      border-color: var(--rk-colors-modalTextDim);
    }
    [data-rk] .ju367vdz:active {
      border-color: var(--rk-colors-modalTextDim);
    }
    [data-rk] .ju367ve0 {
      border-color: var(--rk-colors-modalTextSecondary);
    }
    [data-rk] .ju367ve1:hover {
      border-color: var(--rk-colors-modalTextSecondary);
    }
    [data-rk] .ju367ve2:active {
      border-color: var(--rk-colors-modalTextSecondary);
    }
    [data-rk] .ju367ve3 {
      border-color: var(--rk-colors-profileAction);
    }
    [data-rk] .ju367ve4:hover {
      border-color: var(--rk-colors-profileAction);
    }
    [data-rk] .ju367ve5:active {
      border-color: var(--rk-colors-profileAction);
    }
    [data-rk] .ju367ve6 {
      border-color: var(--rk-colors-profileActionHover);
    }
    [data-rk] .ju367ve7:hover {
      border-color: var(--rk-colors-profileActionHover);
    }
    [data-rk] .ju367ve8:active {
      border-color: var(--rk-colors-profileActionHover);
    }
    [data-rk] .ju367ve9 {
      border-color: var(--rk-colors-profileForeground);
    }
    [data-rk] .ju367vea:hover {
      border-color: var(--rk-colors-profileForeground);
    }
    [data-rk] .ju367veb:active {
      border-color: var(--rk-colors-profileForeground);
    }
    [data-rk] .ju367vec {
      border-color: var(--rk-colors-selectedOptionBorder);
    }
    [data-rk] .ju367ved:hover {
      border-color: var(--rk-colors-selectedOptionBorder);
    }
    [data-rk] .ju367vee:active {
      border-color: var(--rk-colors-selectedOptionBorder);
    }
    [data-rk] .ju367vef {
      border-color: var(--rk-colors-standby);
    }
    [data-rk] .ju367veg:hover {
      border-color: var(--rk-colors-standby);
    }
    [data-rk] .ju367veh:active {
      border-color: var(--rk-colors-standby);
    }
    [data-rk] .ju367vei {
      box-shadow: var(--rk-shadows-connectButton);
    }
    [data-rk] .ju367vej:hover {
      box-shadow: var(--rk-shadows-connectButton);
    }
    [data-rk] .ju367vek:active {
      box-shadow: var(--rk-shadows-connectButton);
    }
    [data-rk] .ju367vel {
      box-shadow: var(--rk-shadows-dialog);
    }
    [data-rk] .ju367vem:hover {
      box-shadow: var(--rk-shadows-dialog);
    }
    [data-rk] .ju367ven:active {
      box-shadow: var(--rk-shadows-dialog);
    }
    [data-rk] .ju367veo {
      box-shadow: var(--rk-shadows-profileDetailsAction);
    }
    [data-rk] .ju367vep:hover {
      box-shadow: var(--rk-shadows-profileDetailsAction);
    }
    [data-rk] .ju367veq:active {
      box-shadow: var(--rk-shadows-profileDetailsAction);
    }
    [data-rk] .ju367ver {
      box-shadow: var(--rk-shadows-selectedOption);
    }
    [data-rk] .ju367ves:hover {
      box-shadow: var(--rk-shadows-selectedOption);
    }
    [data-rk] .ju367vet:active {
      box-shadow: var(--rk-shadows-selectedOption);
    }
    [data-rk] .ju367veu {
      box-shadow: var(--rk-shadows-selectedWallet);
    }
    [data-rk] .ju367vev:hover {
      box-shadow: var(--rk-shadows-selectedWallet);
    }
    [data-rk] .ju367vew:active {
      box-shadow: var(--rk-shadows-selectedWallet);
    }
    [data-rk] .ju367vex {
      box-shadow: var(--rk-shadows-walletLogo);
    }
    [data-rk] .ju367vey:hover {
      box-shadow: var(--rk-shadows-walletLogo);
    }
    [data-rk] .ju367vez:active {
      box-shadow: var(--rk-shadows-walletLogo);
    }
    [data-rk] .ju367vf0 {
      color: var(--rk-colors-accentColor);
    }
    [data-rk] .ju367vf1:hover {
      color: var(--rk-colors-accentColor);
    }
    [data-rk] .ju367vf2:active {
      color: var(--rk-colors-accentColor);
    }
    [data-rk] .ju367vf3 {
      color: var(--rk-colors-accentColorForeground);
    }
    [data-rk] .ju367vf4:hover {
      color: var(--rk-colors-accentColorForeground);
    }
    [data-rk] .ju367vf5:active {
      color: var(--rk-colors-accentColorForeground);
    }
    [data-rk] .ju367vf6 {
      color: var(--rk-colors-actionButtonBorder);
    }
    [data-rk] .ju367vf7:hover {
      color: var(--rk-colors-actionButtonBorder);
    }
    [data-rk] .ju367vf8:active {
      color: var(--rk-colors-actionButtonBorder);
    }
    [data-rk] .ju367vf9 {
      color: var(--rk-colors-actionButtonBorderMobile);
    }
    [data-rk] .ju367vfa:hover {
      color: var(--rk-colors-actionButtonBorderMobile);
    }
    [data-rk] .ju367vfb:active {
      color: var(--rk-colors-actionButtonBorderMobile);
    }
    [data-rk] .ju367vfc {
      color: var(--rk-colors-actionButtonSecondaryBackground);
    }
    [data-rk] .ju367vfd:hover {
      color: var(--rk-colors-actionButtonSecondaryBackground);
    }
    [data-rk] .ju367vfe:active {
      color: var(--rk-colors-actionButtonSecondaryBackground);
    }
    [data-rk] .ju367vff {
      color: var(--rk-colors-closeButton);
    }
    [data-rk] .ju367vfg:hover {
      color: var(--rk-colors-closeButton);
    }
    [data-rk] .ju367vfh:active {
      color: var(--rk-colors-closeButton);
    }
    [data-rk] .ju367vfi {
      color: var(--rk-colors-closeButtonBackground);
    }
    [data-rk] .ju367vfj:hover {
      color: var(--rk-colors-closeButtonBackground);
    }
    [data-rk] .ju367vfk:active {
      color: var(--rk-colors-closeButtonBackground);
    }
    [data-rk] .ju367vfl {
      color: var(--rk-colors-connectButtonBackground);
    }
    [data-rk] .ju367vfm:hover {
      color: var(--rk-colors-connectButtonBackground);
    }
    [data-rk] .ju367vfn:active {
      color: var(--rk-colors-connectButtonBackground);
    }
    [data-rk] .ju367vfo {
      color: var(--rk-colors-connectButtonBackgroundError);
    }
    [data-rk] .ju367vfp:hover {
      color: var(--rk-colors-connectButtonBackgroundError);
    }
    [data-rk] .ju367vfq:active {
      color: var(--rk-colors-connectButtonBackgroundError);
    }
    [data-rk] .ju367vfr {
      color: var(--rk-colors-connectButtonInnerBackground);
    }
    [data-rk] .ju367vfs:hover {
      color: var(--rk-colors-connectButtonInnerBackground);
    }
    [data-rk] .ju367vft:active {
      color: var(--rk-colors-connectButtonInnerBackground);
    }
    [data-rk] .ju367vfu {
      color: var(--rk-colors-connectButtonText);
    }
    [data-rk] .ju367vfv:hover {
      color: var(--rk-colors-connectButtonText);
    }
    [data-rk] .ju367vfw:active {
      color: var(--rk-colors-connectButtonText);
    }
    [data-rk] .ju367vfx {
      color: var(--rk-colors-connectButtonTextError);
    }
    [data-rk] .ju367vfy:hover {
      color: var(--rk-colors-connectButtonTextError);
    }
    [data-rk] .ju367vfz:active {
      color: var(--rk-colors-connectButtonTextError);
    }
    [data-rk] .ju367vg0 {
      color: var(--rk-colors-connectionIndicator);
    }
    [data-rk] .ju367vg1:hover {
      color: var(--rk-colors-connectionIndicator);
    }
    [data-rk] .ju367vg2:active {
      color: var(--rk-colors-connectionIndicator);
    }
    [data-rk] .ju367vg3 {
      color: var(--rk-colors-downloadBottomCardBackground);
    }
    [data-rk] .ju367vg4:hover {
      color: var(--rk-colors-downloadBottomCardBackground);
    }
    [data-rk] .ju367vg5:active {
      color: var(--rk-colors-downloadBottomCardBackground);
    }
    [data-rk] .ju367vg6 {
      color: var(--rk-colors-downloadTopCardBackground);
    }
    [data-rk] .ju367vg7:hover {
      color: var(--rk-colors-downloadTopCardBackground);
    }
    [data-rk] .ju367vg8:active {
      color: var(--rk-colors-downloadTopCardBackground);
    }
    [data-rk] .ju367vg9 {
      color: var(--rk-colors-error);
    }
    [data-rk] .ju367vga:hover {
      color: var(--rk-colors-error);
    }
    [data-rk] .ju367vgb:active {
      color: var(--rk-colors-error);
    }
    [data-rk] .ju367vgc {
      color: var(--rk-colors-generalBorder);
    }
    [data-rk] .ju367vgd:hover {
      color: var(--rk-colors-generalBorder);
    }
    [data-rk] .ju367vge:active {
      color: var(--rk-colors-generalBorder);
    }
    [data-rk] .ju367vgf {
      color: var(--rk-colors-generalBorderDim);
    }
    [data-rk] .ju367vgg:hover {
      color: var(--rk-colors-generalBorderDim);
    }
    [data-rk] .ju367vgh:active {
      color: var(--rk-colors-generalBorderDim);
    }
    [data-rk] .ju367vgi {
      color: var(--rk-colors-menuItemBackground);
    }
    [data-rk] .ju367vgj:hover {
      color: var(--rk-colors-menuItemBackground);
    }
    [data-rk] .ju367vgk:active {
      color: var(--rk-colors-menuItemBackground);
    }
    [data-rk] .ju367vgl {
      color: var(--rk-colors-modalBackdrop);
    }
    [data-rk] .ju367vgm:hover {
      color: var(--rk-colors-modalBackdrop);
    }
    [data-rk] .ju367vgn:active {
      color: var(--rk-colors-modalBackdrop);
    }
    [data-rk] .ju367vgo {
      color: var(--rk-colors-modalBackground);
    }
    [data-rk] .ju367vgp:hover {
      color: var(--rk-colors-modalBackground);
    }
    [data-rk] .ju367vgq:active {
      color: var(--rk-colors-modalBackground);
    }
    [data-rk] .ju367vgr {
      color: var(--rk-colors-modalBorder);
    }
    [data-rk] .ju367vgs:hover {
      color: var(--rk-colors-modalBorder);
    }
    [data-rk] .ju367vgt:active {
      color: var(--rk-colors-modalBorder);
    }
    [data-rk] .ju367vgu {
      color: var(--rk-colors-modalText);
    }
    [data-rk] .ju367vgv:hover {
      color: var(--rk-colors-modalText);
    }
    [data-rk] .ju367vgw:active {
      color: var(--rk-colors-modalText);
    }
    [data-rk] .ju367vgx {
      color: var(--rk-colors-modalTextDim);
    }
    [data-rk] .ju367vgy:hover {
      color: var(--rk-colors-modalTextDim);
    }
    [data-rk] .ju367vgz:active {
      color: var(--rk-colors-modalTextDim);
    }
    [data-rk] .ju367vh0 {
      color: var(--rk-colors-modalTextSecondary);
    }
    [data-rk] .ju367vh1:hover {
      color: var(--rk-colors-modalTextSecondary);
    }
    [data-rk] .ju367vh2:active {
      color: var(--rk-colors-modalTextSecondary);
    }
    [data-rk] .ju367vh3 {
      color: var(--rk-colors-profileAction);
    }
    [data-rk] .ju367vh4:hover {
      color: var(--rk-colors-profileAction);
    }
    [data-rk] .ju367vh5:active {
      color: var(--rk-colors-profileAction);
    }
    [data-rk] .ju367vh6 {
      color: var(--rk-colors-profileActionHover);
    }
    [data-rk] .ju367vh7:hover {
      color: var(--rk-colors-profileActionHover);
    }
    [data-rk] .ju367vh8:active {
      color: var(--rk-colors-profileActionHover);
    }
    [data-rk] .ju367vh9 {
      color: var(--rk-colors-profileForeground);
    }
    [data-rk] .ju367vha:hover {
      color: var(--rk-colors-profileForeground);
    }
    [data-rk] .ju367vhb:active {
      color: var(--rk-colors-profileForeground);
    }
    [data-rk] .ju367vhc {
      color: var(--rk-colors-selectedOptionBorder);
    }
    [data-rk] .ju367vhd:hover {
      color: var(--rk-colors-selectedOptionBorder);
    }
    [data-rk] .ju367vhe:active {
      color: var(--rk-colors-selectedOptionBorder);
    }
    [data-rk] .ju367vhf {
      color: var(--rk-colors-standby);
    }
    [data-rk] .ju367vhg:hover {
      color: var(--rk-colors-standby);
    }
    [data-rk] .ju367vhh:active {
      color: var(--rk-colors-standby);
    }
    @media screen and (min-width: 768px) {
      [data-rk] .ju367v1 {
        align-items: flex-start;
      }
      [data-rk] .ju367v3 {
        align-items: flex-end;
      }
      [data-rk] .ju367v5 {
        align-items: center;
      }
      [data-rk] .ju367v7 {
        display: none;
      }
      [data-rk] .ju367v9 {
        display: block;
      }
      [data-rk] .ju367vb {
        display: flex;
      }
      [data-rk] .ju367vd {
        display: inline;
      }
    }

    /* vanilla-extract-css-ns:src/css/touchableStyles.css.ts.vanilla.css?source=Ll8xMmNibzhpMywuXzEyY2JvOGkzOjphZnRlciB7CiAgLS1fMTJjYm84aTA6IDE7CiAgLS1fMTJjYm84aTE6IDE7Cn0KLl8xMmNibzhpMzpob3ZlciB7CiAgdHJhbnNmb3JtOiBzY2FsZSh2YXIoLS1fMTJjYm84aTApKTsKfQouXzEyY2JvOGkzOmFjdGl2ZSB7CiAgdHJhbnNmb3JtOiBzY2FsZSh2YXIoLS1fMTJjYm84aTEpKTsKfQouXzEyY2JvOGkzOmFjdGl2ZTo6YWZ0ZXIgewogIGNvbnRlbnQ6ICIiOwogIGJvdHRvbTogLTFweDsKICBkaXNwbGF5OiBibG9jazsKICBsZWZ0OiAtMXB4OwogIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICByaWdodDogLTFweDsKICB0b3A6IC0xcHg7CiAgdHJhbnNmb3JtOiBzY2FsZShjYWxjKCgxIC8gdmFyKC0tXzEyY2JvOGkxKSkgKiB2YXIoLS1fMTJjYm84aTApKSk7Cn0KLl8xMmNibzhpNCwuXzEyY2JvOGk0OjphZnRlciB7CiAgLS1fMTJjYm84aTA6IDEuMDI1Owp9Ci5fMTJjYm84aTUsLl8xMmNibzhpNTo6YWZ0ZXIgewogIC0tXzEyY2JvOGkwOiAxLjE7Cn0KLl8xMmNibzhpNiwuXzEyY2JvOGk2OjphZnRlciB7CiAgLS1fMTJjYm84aTE6IDAuOTU7Cn0KLl8xMmNibzhpNywuXzEyY2JvOGk3OjphZnRlciB7CiAgLS1fMTJjYm84aTE6IDAuOTsKfQ== */
    [data-rk] ._12cbo8i3,
    [data-rk] ._12cbo8i3::after {
      --_12cbo8i0: 1;
      --_12cbo8i1: 1;
    }
    [data-rk] ._12cbo8i3:hover {
      transform: scale(var(--_12cbo8i0));
    }
    [data-rk] ._12cbo8i3:active {
      transform: scale(var(--_12cbo8i1));
    }
    [data-rk] ._12cbo8i3:active::after {
      content: "";
      bottom: -1px;
      display: block;
      left: -1px;
      position: absolute;
      right: -1px;
      top: -1px;
      transform: scale(calc((1 / var(--_12cbo8i1)) * var(--_12cbo8i0)));
    }
    [data-rk] ._12cbo8i4,
    [data-rk] ._12cbo8i4::after {
      --_12cbo8i0: 1.025;
    }
    [data-rk] ._12cbo8i5,
    [data-rk] ._12cbo8i5::after {
      --_12cbo8i0: 1.1;
    }
    [data-rk] ._12cbo8i6,
    [data-rk] ._12cbo8i6::after {
      --_12cbo8i1: 0.95;
    }
    [data-rk] ._12cbo8i7,
    [data-rk] ._12cbo8i7::after {
      --_12cbo8i1: 0.9;
    }

    /* vanilla-extract-css-ns:src/components/Icons/Icons.css.ts.vanilla.css?source=QGtleWZyYW1lcyBfMWx1dWxlNDEgewogIDAlIHsKICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOwogIH0KICAxMDAlIHsKICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7CiAgfQp9Ci5fMWx1dWxlNDIgewogIGFuaW1hdGlvbjogXzFsdXVsZTQxIDNzIGluZmluaXRlIGxpbmVhcjsKfQouXzFsdXVsZTQzIHsKICBiYWNrZ3JvdW5kOiBjb25pYy1ncmFkaWVudChmcm9tIDE4MGRlZyBhdCA1MCUgNTAlLCByZ2JhKDcyLCAxNDYsIDI1NCwgMCkgMGRlZywgY3VycmVudENvbG9yIDI4Mi4wNGRlZywgcmdiYSg3MiwgMTQ2LCAyNTQsIDApIDMxOS44NmRlZywgcmdiYSg3MiwgMTQ2LCAyNTQsIDApIDM2MGRlZyk7CiAgaGVpZ2h0OiAyMXB4OwogIHdpZHRoOiAyMXB4Owp9 */
    @keyframes _1luule41 {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    [data-rk] ._1luule42 {
      animation: _1luule41 3s infinite linear;
    }
    [data-rk] ._1luule43 {
      background: conic-gradient(from 180deg at 50% 50%, rgba(72, 146, 254, 0) 0deg, currentColor 282.04deg, rgba(72, 146, 254, 0) 319.86deg, rgba(72, 146, 254, 0) 360deg);
      height: 21px;
      width: 21px;
    }

    /* vanilla-extract-css-ns:src/components/Dialog/Dialog.css.ts.vanilla.css?source=QGtleWZyYW1lcyBfOXBtNGtpMCB7CiAgMCUgewogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDEwMCUpOwogIH0KICAxMDAlIHsKICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsKICB9Cn0KQGtleWZyYW1lcyBfOXBtNGtpMSB7CiAgMCUgewogICAgb3BhY2l0eTogMDsKICB9CiAgMTAwJSB7CiAgICBvcGFjaXR5OiAxOwogIH0KfQouXzlwbTRraTMgewogIGFuaW1hdGlvbjogXzlwbTRraTEgMTUwbXMgZWFzZTsKICBib3R0b206IC0yMDBweDsKICBsZWZ0OiAtMjAwcHg7CiAgcGFkZGluZzogMjAwcHg7CiAgcmlnaHQ6IC0yMDBweDsKICB0b3A6IC0yMDBweDsKICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVooMCk7CiAgei1pbmRleDogMjE0NzQ4MzY0NjsKfQouXzlwbTRraTUgewogIGFuaW1hdGlvbjogXzlwbTRraTAgMzUwbXMgY3ViaWMtYmV6aWVyKC4xNSwxLjE1LDAuNiwxLjAwKSwgXzlwbTRraTEgMTUwbXMgZWFzZTsKICBtYXgtd2lkdGg6IDEwMHZ3Owp9 */
    @keyframes _9pm4ki0 {
      0% {
        transform: translateY(100%);
      }
      100% {
        transform: translateY(0);
      }
    }
    @keyframes _9pm4ki1 {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    [data-rk] ._9pm4ki3 {
      animation: _9pm4ki1 150ms ease;
      bottom: -200px;
      left: -200px;
      padding: 200px;
      right: -200px;
      top: -200px;
      transform: translateZ(0);
      z-index: 2147483646;
    }
    [data-rk] ._9pm4ki5 {
      animation: _9pm4ki0 350ms cubic-bezier(.15, 1.15, 0.6, 1.00), _9pm4ki1 150ms ease;
      max-width: 100vw;
    }

    /* vanilla-extract-css-ns:src/components/Dialog/DialogContent.css.ts.vanilla.css?source=Ll8xY2tqcG9rMSB7CiAgYm94LXNpemluZzogY29udGVudC1ib3g7CiAgbWF4LXdpZHRoOiAxMDB2dzsKICB3aWR0aDogMzYwcHg7Cn0KLl8xY2tqcG9rMiB7CiAgd2lkdGg6IDEwMHZ3Owp9Ci5fMWNranBvazMgewogIG1pbi13aWR0aDogNzIwcHg7CiAgd2lkdGg6IDcyMHB4Owp9Ci5fMWNranBvazQgewogIG1pbi13aWR0aDogMzY4cHg7CiAgd2lkdGg6IDM2OHB4Owp9Ci5fMWNranBvazYgewogIGJvcmRlci13aWR0aDogMHB4OwogIGJveC1zaXppbmc6IGJvcmRlci1ib3g7CiAgd2lkdGg6IDEwMHZ3Owp9CkBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDc2OHB4KSB7CiAgLl8xY2tqcG9rMSB7CiAgICB3aWR0aDogMzYwcHg7CiAgfQogIC5fMWNranBvazIgewogICAgd2lkdGg6IDQ4MHB4OwogIH0KICAuXzFja2pwb2s0IHsKICAgIG1pbi13aWR0aDogMzY4cHg7CiAgICB3aWR0aDogMzY4cHg7CiAgfQp9CkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc2N3B4KSB7CiAgLl8xY2tqcG9rNyB7CiAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiAwOwogICAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IDA7CiAgICBtYXJnaW4tdG9wOiAtMjAwcHg7CiAgICBwYWRkaW5nLWJvdHRvbTogMjAwcHg7CiAgICB0b3A6IDIwMHB4OwogIH0KfQ== */
    [data-rk] ._1ckjpok1 {
      box-sizing: content-box;
      max-width: 100vw;
      width: 360px;
    }
    [data-rk] ._1ckjpok2 {
      width: 100vw;
    }
    [data-rk] ._1ckjpok3 {
      min-width: 720px;
      width: 720px;
    }
    [data-rk] ._1ckjpok4 {
      min-width: 368px;
      width: 368px;
    }
    [data-rk] ._1ckjpok6 {
      border-width: 0px;
      box-sizing: border-box;
      width: 100vw;
    }
    @media screen and (min-width: 768px) {
      [data-rk] ._1ckjpok1 {
        width: 360px;
      }
      [data-rk] ._1ckjpok2 {
        width: 480px;
      }
      [data-rk] ._1ckjpok4 {
        min-width: 368px;
        width: 368px;
      }
    }
    @media screen and (max-width: 767px) {
      [data-rk] ._1ckjpok7 {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        margin-top: -200px;
        padding-bottom: 200px;
        top: 200px;
      }
    }

    /* vanilla-extract-css-ns:src/components/MenuButton/MenuButton.css.ts.vanilla.css?source=LnY5aG9yYjA6aG92ZXIgewogIGJhY2tncm91bmQ6IHVuc2V0Owp9 */
    [data-rk] .v9horb0:hover {
      background: unset;
    }

    /* vanilla-extract-css-ns:src/components/ChainModal/ChainModal.css.ts.vanilla.css?source=Ll8xOGRxdzl4MCB7CiAgbWF4LWhlaWdodDogNDU2cHg7CiAgb3ZlcmZsb3cteTogYXV0bzsKICBvdmVyZmxvdy14OiBoaWRkZW47Cn0KLl8xOGRxdzl4MSB7CiAgbWF4LWhlaWdodDogNDU2cHg7CiAgb3ZlcmZsb3cteTogYXV0bzsKICBvdmVyZmxvdy14OiBoaWRkZW47CiAgc2Nyb2xsYmFyLXdpZHRoOiBub25lOwp9Ci5fMThkcXc5eDE6Oi13ZWJraXQtc2Nyb2xsYmFyIHsKICBkaXNwbGF5OiBub25lOwp9 */
    [data-rk] ._18dqw9x0 {
      max-height: 456px;
      overflow-y: auto;
      overflow-x: hidden;
    }
    [data-rk] ._18dqw9x1 {
      max-height: 456px;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
    }
    [data-rk] ._18dqw9x1::-webkit-scrollbar {
      display: none;
    }

    /* vanilla-extract-css-ns:src/components/ModalSelection/ModalSelection.css.ts.vanilla.css?source=Lmc1a2wwbDAgewogIGJvcmRlci1jb2xvcjogdHJhbnNwYXJlbnQ7Cn0= */
    [data-rk] .g5kl0l0 {
      border-color: transparent;
    }

    /* vanilla-extract-css-ns:src/components/ConnectOptions/DesktopOptions.css.ts.vanilla.css?source=Ll8xdnd0MGNnMCB7CiAgYmFja2dyb3VuZDogd2hpdGU7Cn0KLl8xdnd0MGNnMiB7CiAgbWF4LWhlaWdodDogNDU0cHg7CiAgb3ZlcmZsb3cteTogYXV0bzsKfQouXzF2d3QwY2czIHsKICBtaW4td2lkdGg6IDI4N3B4Owp9Ci5fMXZ3dDBjZzQgewogIG1pbi13aWR0aDogMTAwJTsKfQ== */
    [data-rk] ._1vwt0cg0 {
      background: white;
    }
    [data-rk] ._1vwt0cg2 {
      max-height: 454px;
      overflow-y: auto;
    }
    [data-rk] ._1vwt0cg3 {
      min-width: 287px;
    }
    [data-rk] ._1vwt0cg4 {
      min-width: 100%;
    }

    /* vanilla-extract-css-ns:src/components/ConnectOptions/MobileOptions.css.ts.vanilla.css?source=QGtleWZyYW1lcyBfMWFtMTQ0MTEgewogIDAlIHsKICAgIHN0cm9rZS1kYXNob2Zmc2V0OiAwOwogIH0KICAxMDAlIHsKICAgIHN0cm9rZS1kYXNob2Zmc2V0OiAtMjgzOwogIH0KfQouXzFhbTE0NDEwIHsKICBvdmVyZmxvdzogYXV0bzsKICBzY3JvbGxiYXItd2lkdGg6IG5vbmU7CiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVaKDApOwp9Ci5fMWFtMTQ0MTA6Oi13ZWJraXQtc2Nyb2xsYmFyIHsKICBkaXNwbGF5OiBub25lOwp9Ci5fMWFtMTQ0MTIgewogIGFuaW1hdGlvbjogXzFhbTE0NDExIDFzIGxpbmVhciBpbmZpbml0ZTsKICBzdHJva2UtZGFzaGFycmF5OiA5OCAxOTY7CiAgZmlsbDogbm9uZTsKICBzdHJva2UtbGluZS1jYXA6IHJvdW5kOwogIHN0cm9rZS13aWR0aDogNDsKfQouXzFhbTE0NDEzIHsKICBwb3NpdGlvbjogYWJzb2x1dGU7Cn0= */
    @keyframes _1am14411 {
      0% {
        stroke-dashoffset: 0;
      }
      100% {
        stroke-dashoffset: -283;
      }
    }
    [data-rk] ._1am14410 {
      overflow: auto;
      scrollbar-width: none;
      transform: translateZ(0);
    }
    [data-rk] ._1am14410::-webkit-scrollbar {
      display: none;
    }
    [data-rk] ._1am14412 {
      animation: _1am14411 1s linear infinite;
      stroke-dasharray: 98 196;
      fill: none;
      stroke-line-cap: round;
      stroke-width: 4;
    }
    [data-rk] ._1am14413 {
      position: absolute;
    }

    /* vanilla-extract-css-ns:src/components/WalletButton/WalletButton.css.ts.vanilla.css?source=Ll8xeTJsbmZpMCB7CiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgxNiwgMjEsIDMxLCAwLjA2KTsKfQouXzF5MmxuZmkxIHsKICBtYXgtd2lkdGg6IGZpdC1jb250ZW50Owp9 */
    [data-rk] ._1y2lnfi0 {
      border: 1px solid rgba(16, 21, 31, 0.06);
    }
    [data-rk] ._1y2lnfi1 {
      max-width: -moz-fit-content;
      max-width: fit-content;
    }

    .rainBowKitContainer {
      flex-direction: row-reverse !important;
    }

    .rainBowKitTextsContainer {
      display: flex;
      padding: 37px;
    }

    .rainBowKitTextsTitleContainer {
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 8px;
    }

    .rainBowKitTextsContainer.dark .rainBowKitTextsTitle {
      color: #d4cae0;
    }
    .rainBowKitTextsContainer.light .rainBowKitTextsTitle {
      color: #4A3A61;
    }
    .rainBowKitTextsTitle {
      display: flex;
      font-family: 'Inter';
      font-size: 1.125rem; // 18/16
      font-style: normal;
      font-weight: 400;
      line-height: 1.33333; // 24/18
      margin-top: 30px;
    }
    .rainBowKitTextsContainer.dark .rainBowKitTextsSubtitle {
      color: #978aa8;
    }
    .rainBowKitTextsContainer.light .rainBowKitTextsSubtitle {
      color: #7e738c;
    }
    .rainBowKitTextsSubtitle {
      display: flex;
      font-family: 'Inter';
      font-size: 0.875rem; // 14/16
      font-style: normal;
      font-weight: 500;
      line-height: 1.28571; // 18/14
    }
    .rainBowKitTextsCaptionContainer {
      display: flex;
      flex-direction: column;
    }
    .rainBowKitTextsContainer.dark .rainBowKitTextsCaption {
      color: #978aa8;
    }
    .rainBowKitTextsContainer.light .rainBowKitTextsCaption {
      color: #7e738c;
    }
    .rainBowKitTextsCaption {
      display: flex;
      font-family: 'Inter';
      font-size: 0.75rem; // 14/16
      font-style: normal;
      font-weight: 500;
      line-height: 1.28571; // 18/14
    }
  `,
};
