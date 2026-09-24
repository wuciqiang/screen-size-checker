# Device reference tables

`device-reference.json` is the shared build input for the iPhone, iPad and Android viewport pages. `build/device-reference-table.js` renders every row into static HTML for all six active languages. The browser script only filters existing rows; it does not fetch or infer specifications.

For a data update:

1. Match the exact manufacturer model and display state (cover/main where applicable). Keep stable row IDs and record naming changes in `previous_model_label`.
2. Add only fields explicitly supported by the source. For every non-null hardware field, provide a public HTTPS source URL, a specific locator, the original quotation, access time and source snapshot SHA-256 in `field_provenance`.
3. Keep unverified values null. `reference_viewport` and `reference_dpr` are separately labelled, unverified candidates from the previous table. They are not browser measurements. Do not infer a viewport by dividing native resolution by an unverified DPR. Candidates associated with corrected panel specifications are withheld from display and retained only in the audit data.
4. Native pixel dimensions use short edge × long edge. Body dimensions use width × height × depth in mm. Diagonal and PPI retain the manufacturer's precision; do not replace quoted PPI with a calculation based on a rounded diagonal.
5. Update `data_as_of` and the three pages' visible review date and Article `dateModified` together. Per-source access dates describe the individual evidence. Partial review does not mean all devices were measured.
6. Build, validate the six locales and compare the 18 generated tables. Use OpenCLI to test model/manufacturer filtering, no-result recovery, source details and a 390 CSS px layout. Review factual changes independently before committing; obtain approval before pushing.

The initial evidence batch is archived in the analytics workspace under `screensizechecker.com/workstreams/20260924T140000+0800-g6-device-source-matrix/evidence/`, including original source snapshots, collection scripts and validation results. `evidence_inputs` records the hashes of the exact input reports used for this dataset.
