import * as cdk from "@aws-cdk/core";
import * as athena from "@aws-cdk/aws-athena";
import * as glue from "@aws-cdk/aws-glue";
import * as s3 from "@aws-cdk/aws-s3";
import { CfnTable } from "@aws-cdk/aws-glue";

// Initialise project
// cdk init app --language typescript
// Deployment
// cdk synth
// cdk deploy

export class AthenaCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Second argument are construct IDs - same names can exist in different scopes
    // https://docs.aws.amazon.com/cdk/latest/guide/identifiers.html

    // No upper case letters for names
    const athenaDbName: string = "athena_db"; 
    const athenaDbNameConstructorId: string = "athena_db";
    const athenaTableName: string = "athena_db"; 
    const configBucketSnapshotArn = "arn:aws:s3:::config-bucket-320562168102"

    

    // Create a new database
    var database = new glue.Database(this, athenaDbNameConstructorId, {
      databaseName: athenaDbName,
    });

    // Import existing bucket
    const configSnapshotBucket = s3.Bucket.fromBucketAttributes(this, "ImportedBucket", {
      bucketArn: configBucketSnapshotArn,
    });

    const nestedSnapshotStruct: glue.Type = createNestedStructure();
    
    // TODO: add SerdeProperties and Table Properties such that it matches what we have for Canary
    // let cfnAthenaTable = new glue.CfnTable(this, athenaTableName, {
    //   'catalogId':'',
    //   'databaseName':'',
    //   'tableInput': {},
    // });

    // Create new table to reference a database
    let athenaTable = new glue.Table(this, athenaTableName, {
      bucket: configSnapshotBucket,
      columns: [
        { name: "fileversion", type: glue.Schema.STRING },
        { name: "configSnapshotId", type: glue.Schema.STRING },
        {
          name: "configurationItems",
          type: glue.Schema.array(nestedSnapshotStruct),
        },
      ],
      compressed: false,
      dataFormat: glue.DataFormat.JSON,
      database: database,
      description: "AWS Config Snapshop Table",
      partitionKeys: [
        { name: "accountid", type: glue.Schema.STRING },
        { name: "dt", type: glue.Schema.STRING },
        { name: "region", type: glue.Schema.STRING },
      ],
      s3Prefix: "AWSLogs/",
      tableName: "aws_config_configuration_snapshot",
      
    });
    // Data Format: https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-glue.DataFormat.html

    
    
  }
}

// Nested Struct in Glue Table Columns above
function createNestedStructure(): glue.Type {
  let nestedSnapshotStruct: glue.Type = glue.Schema.struct([
    { name: "configurationItemVersion", type: glue.Schema.STRING },
    { name: "configurationItemCaptureTime", type: glue.Schema.STRING },
    { name: "configurationStateId", type: glue.Schema.BIG_INT },
    { name: "configurationItemVersion", type: glue.Schema.STRING },
    { name: "awsAccountId", type: glue.Schema.STRING },
    { name: "configurationItemStatus", type: glue.Schema.STRING },
    { name: "resourceType", type: glue.Schema.STRING },
    { name: "resourceId", type: glue.Schema.STRING },
    { name: "resourceName", type: glue.Schema.STRING },
    { name: "ARN", type: glue.Schema.STRING },
    { name: "awsRegion", type: glue.Schema.STRING },
    { name: "availabilityZone", type: glue.Schema.STRING },
    { name: "configurationStateMd5Hash", type: glue.Schema.STRING },
    { name: "configuration", type: glue.Schema.STRING },
    { name: "resourceCreationTime", type: glue.Schema.STRING },
    {
      name: "supplementaryConfiguration",
      type: glue.Schema.map(glue.Schema.STRING, glue.Schema.STRING),
    },
    {
      name: "tags",
      type: glue.Schema.map(glue.Schema.STRING, glue.Schema.STRING),
    },
  ]);
  return nestedSnapshotStruct;
}