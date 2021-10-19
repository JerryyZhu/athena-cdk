// General Constants
export const athenaDbName: string = "config_configuration_db"; 
export const athenaDbNameConstructorId: string = "config_configuration_db";
export const athenaTableName: string = "config_ext_table"; 
export const configBucketSnapshotArn = "arn:aws:s3:::config-bucket-320562168102"

// Individual Resources view
export const indiv_query = 
`
CREATE OR REPLACE VIEW individual_resources AS
SELECT
    "accountId" "AccountId",
    "configurationItem"."awsregion" "Region",
    "split_part"("configurationItem"."resourceId", '/', 1) "ResourceType"
    ,"split_part"("configurationItem"."resourceId", '/', 2) "ResourceId"
    ,"configurationItem"."configuration" "Configuration"
    ,"configurationItem"."resourceType" "configResourceType"
    ,"configurationItem"."supplementaryConfiguration" "supplementaryConfiguration"
    ,"configurationItem"."configurationItemVersion" "configurationItemVersion"
    ,"configurationItem"."configurationItemCaptureTime" "configurationItemCaptureTime"
    ,"configurationItem"."configurationItemStatus" "configurationItemStatus"
FROM
  (aws_config_configuration_snapshot
CROSS JOIN UNNEST("configurationitems") t (configurationItem))
WHERE (("configurationItem"."resourceType" = 'AWS::Config::ResourceCompliance') AND (dt = 'latest'))
`
export const indiv_name = "create_indiv_view"
export const indiv_desc = `Create a table to expand the nested data into a resource level view of config records where resourceType is AWS::Config::ResourceCompliance`
