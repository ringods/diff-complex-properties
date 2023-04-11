# Reproducing a bug in Azure Native provider regarding diff calculation

There is a [possible bug](https://github.com/pulumi/pulumi-azure-native/issues/2356) in the Azure Native 
provider regarding the calculation of the resource diff for complex properties like arrays or maps.

Steps:

1. clone this repository, configure Pulumi & Azure credentials and create a stack.
1. run `pulumi up`
1. change the disk caching for the VM from Read/Write to Read Only
   1. Open the Azure portal
   1. Search the `diff-complex-properties<hash>` resource group
   1. Open the VM details
   1. Click on `Disks` in the left sidebar
   1. Change `Host caching` of the OS disk from `Read/write` to `Read-only`
   1. Complete the change by pressing the `Save` button
1. run `pulumi refresh`

    The proposed diff for the `storageProfile` only lists the `caching` property being changed:

    ```log
        ~ osDisk        : {
            ~ caching     : "ReadWrite" => "ReadOnly"
            createOption: "FromImage"
            deleteOption: "Detach"
            diskSizeGB  : 127
            managedDisk : {
                id                : "/subscriptions/32b9cb2e-69be-4040-80a6-02cd6b2cc5ec/resourceGroups/diff-complex-propertiesfd49918b/providers/Microsoft.Compute/disks/vmtest01_disk1_c8e15753641c458584260f6ba3fa57ef"
                storageAccountType: "Premium_LRS"
            }
            name        : "vmtest01_disk1_c8e15753641c458584260f6ba3fa57ef"
            osType      : "Windows"
        }
    ```

1. run `pulumi up`

    Next to reverting the `caching` property back to what is defined in the code, the diff shows some additional disk related
    properties that will be removed:

    ```log
    pulumi:pulumi:Stack: (same)
    [urn=urn:pulumi:ringo::diff-complex-properties::pulumi:pulumi:Stack::diff-complex-properties-ringo]
    ~ azure-native:compute:VirtualMachine: (update)
        [id=/subscriptions/redacted-subscription/resourceGroups/diff-complex-propertiesfd49918b/providers/Microsoft.Compute/virtualMachines/vmtest]
        [urn=urn:pulumi:ringo::diff-complex-properties::azure-native:compute:VirtualMachine::smc1]
        [provider=urn:pulumi:ringo::diff-complex-properties::pulumi:providers:azure-native::default_1_99_1::3066851b-e2a4-4ec6-92d1-06688625d723]
        ~ storageProfile: {
            ~ dataDisks: [
                ~ [0]: {
                        - caching     : "None"
                        - deleteOption: "Detach"
                        - diskSizeGB  : 1024
                        ~ managedDisk : {
                            - storageAccountType: "Premium_LRS"
                        }
                        - name        : "dataDisk1"
                        - toBeDetached: false
                    }
            ]
            ~ osDisk   : {
                ~ caching     : "ReadOnly" => "ReadWrite"
                - deleteOption: "Detach"
                ~ managedDisk : {
                    - id: "/subscriptions/redacted-subscription/resourceGroups/diff-complex-propertiesfd49918b/providers/Microsoft.Compute/disks/vmtest01_disk1_c8e15753641c458584260f6ba3fa57ef"
                }
            }
        }
    ```

These additional properties are unexpected in the diff.
