import importlib.util
from pathlib import Path
import unittest
import datetime as dt

s = importlib.util.spec_from_file_location('retention', Path(__file__).with_name('vcode-retention.py'))
r = importlib.util.module_from_spec(s)
s.loader.exec_module(r)
NOW = dt.datetime(2026, 10, 15, tzinfo=dt.timezone.utc)


class RetentionSafety(unittest.TestCase):
    def setUp(self):
        self.image = {'id': 'old', 'created': '2026-09-01T00:00:00Z', 'tags': ['vcode-prod-web:accepted-old']}
        self.accepted = {'accepted-old': {'web': 'old', 'blog': 'b'}}

    def selected(self, image=None, protected=None):
        return r.select([image or self.image], protected or set(), self.accepted, NOW)[0]

    def test_only_attested_old_owned_image_can_be_selected(self):
        self.assertEqual(self.selected(), [self.image])

    def test_stopped_foreign_container_image_is_protected(self):
        self.assertEqual(self.selected(protected={'old'}), [])

    def test_foreign_alias_protects_the_entire_shared_image(self):
        self.assertEqual(self.selected({**self.image, 'tags': self.image['tags'] + ['other-app:old']}), [])

    def test_unaccepted_alias_protects_the_entire_image(self):
        self.assertEqual(self.selected({**self.image, 'tags': self.image['tags'] + ['vcode-prod-web:unreviewed']}), [])

    def test_manual_rollback_and_before_aliases_always_win(self):
        for alias in ['rollback-manual', 'before-release', 'runtime-base-20261001', 'keep-for-operator']:
            self.assertEqual(self.selected({**self.image, 'tags': ['vcode-prod-web:' + alias]}), [])

    def test_unclassified_untagged_images_are_never_globally_pruned(self):
        self.assertEqual(self.selected({**self.image, 'tags': []}), [])

    def test_fresh_in_progress_image_is_not_eligible(self):
        self.assertEqual(self.selected({**self.image, 'created': '2026-10-14T00:00:00Z'}), [])

    def test_reducing_configured_age_does_not_bypass_fourteen_day_floor(self):
        images = [{**self.image, 'created': '2026-10-08T00:00:00Z'}]
        self.assertEqual(r.select(images, set(), self.accepted, NOW, age_days=0)[0], [])

    def generation_fixture(self):
        accepted = {str(i): {'web': 'w'+str(i), 'blog': 'b'+str(i), 'receiptSHA256': str(i)} for i in range(3)}
        policy = {'generations': [{'release': str(i), 'receiptSHA256': str(i)} for i in range(3)]}
        images = [{'id': role + str(i)} for i in range(3) for role in ['w', 'b']]
        containers = [{'name': 'vcode-prod-web-1', 'running': True, 'image': 'w0'}, {'name': 'vcode-prod-blog-1', 'running': True, 'image': 'b0'}, {'name': 'foreign-stopped', 'running': False, 'image': 'shared'}]
        return policy, accepted, images, containers

    def test_current_two_verified_rollbacks_and_every_container_are_retained(self):
        protected = r.protected_images(*self.generation_fixture())
        self.assertEqual(protected, {'w0', 'b0', 'w1', 'b1', 'w2', 'b2', 'shared'})

    def test_missing_rollback_image_stops_retention(self):
        p, a, i, c = self.generation_fixture()
        with self.assertRaises(RuntimeError): r.protected_images(p, a, i[:-1], c)

    def test_changed_receipt_stops_retention(self):
        p, a, i, c = self.generation_fixture()
        a['1']['receiptSHA256'] = 'changed'
        with self.assertRaises(RuntimeError): r.protected_images(p, a, i, c)

    def test_unregistered_new_deployment_stops_retention(self):
        p, a, i, c = self.generation_fixture()
        c[0]['image'] = 'new-build'
        with self.assertRaises(RuntimeError): r.protected_images(p, a, i, c)

    def test_duplicate_or_incomplete_rollback_generations_refuse(self):
        p, a, i, c = self.generation_fixture()
        p['generations'] = p['generations'][:2]
        with self.assertRaises(RuntimeError): r.protected_images(p, a, i, c)


if __name__ == '__main__': unittest.main()
