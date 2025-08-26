import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCleaningAssignments } from '@/hooks/useCleaningAssignments';
import { RefreshCw, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { cleaningAssignmentUtils } from '@/lib/firestore';

export const MigrationTool = () => {
  const { migrateOldAssignments, loading: migrationLoading } = useCleaningAssignments();
  const [migrationResult, setMigrationResult] = useState<string | null>(null);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const handleMigration = async () => {
    try {
      setMigrationResult(null);
      await migrateOldAssignments();
      setMigrationResult('Migration completed successfully! Check the console for details.');
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationResult('Migration failed. Check the console for details.');
    }
  };

  const handleCleanup = async () => {
    try {
      setCleanupLoading(true);
      setCleanupResult(null);
      
      // Get all cleaning assignments
      const allAssignments = await cleaningAssignmentUtils.getAll();
      
      // Filter for old format documents (simple date IDs)
      const oldFormatDocs = allAssignments.filter(doc => {
        // Old format: just a date like "2025-03-21"
        // New format: date with underscore and booking ID like "2025-03-21_0-HM4WE9TKFN-i3fkl5jqe5"
        return !doc.id.includes('_');
      });
      
      console.log(`Found ${oldFormatDocs.length} old format documents to delete:`, oldFormatDocs.map(doc => doc.id));
      
      if (oldFormatDocs.length === 0) {
        setCleanupResult('No old format documents found to delete.');
        return;
      }
      
      // Delete each old format document
      let deletedCount = 0;
      for (const doc of oldFormatDocs) {
        try {
          await cleaningAssignmentUtils.delete(doc.id);
          deletedCount++;
          console.log(`Deleted old document: ${doc.id}`);
        } catch (error) {
          console.error(`Failed to delete document ${doc.id}:`, error);
        }
      }
      
      setCleanupResult(`Successfully deleted ${deletedCount} old format documents. Check the console for details.`);
    } catch (error) {
      console.error('Cleanup failed:', error);
      setCleanupResult('Cleanup failed. Check the console for details.');
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Migration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Database Migration Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              This tool will migrate old cleaning assignment documents from simple date IDs 
              (e.g., "2025-03-21") to composite IDs (e.g., "2025-03-21_0-HM4WE9TKFN-i3fkl5jqe5").
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <strong>Important:</strong> This will create new documents with the correct format. 
                  Run the cleanup tool below to delete old documents after verification.
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleMigration}
            disabled={migrationLoading}
            className="w-full"
            variant="outline"
          >
            {migrationLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Migration...
              </>
            ) : (
              'Run Migration'
            )}
          </Button>

          {migrationResult && (
            <div className={`p-3 rounded border ${
              migrationResult.includes('failed') 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <div className="flex items-center gap-2">
                {migrationResult.includes('failed') ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{migrationResult}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cleanup Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Cleanup Old Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              This tool will delete all old cleaning assignment documents that have simple date IDs 
              (e.g., "2025-03-21") after you've verified the migration was successful.
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-800">
                  <strong>Warning:</strong> This action is irreversible! Only run this after you've 
                  verified that the migration created new documents correctly.
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleCleanup}
            disabled={cleanupLoading}
            className="w-full"
            variant="destructive"
          >
            {cleanupLoading ? (
              <>
                <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting Old Documents...
              </>
            ) : (
              'Delete Old Documents'
            )}
          </Button>

          {cleanupResult && (
            <div className={`p-3 rounded border ${
              cleanupResult.includes('failed') 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <div className="flex items-center gap-2">
                {cleanupResult.includes('failed') ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{cleanupResult}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
